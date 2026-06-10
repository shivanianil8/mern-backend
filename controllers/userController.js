import User from '../models/user.js'
import Product from '../models/product.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
} from '../utils/sendEmail.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/signup
export const userSign = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' })
    }
    if (name.trim().length > 50) {
      return res.status(400).json({ message: 'Name must be less than 50 characters' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }
    if (password.length > 20) {
      return res.status(400).json({ message: 'Password must be less than 20 characters' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const verificationToken  = crypto.randomBytes(32).toString('hex')
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const user = await User.create({
      name, email, password: hashed,
      verificationToken, verificationExpiry
    })

    await sendVerificationEmail(email, name, verificationToken)

    res.status(201).json({
      message: 'Signup successful! Please check your email to verify your account.',
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await User.findOne({
      verificationToken: token,
      verificationExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).send(`
        <div style="font-family: Arial; text-align: center; padding: 4rem; background: #0a0a0a; color: white; min-height: 100vh;">
          <h1 style="color: #ef4444;">Link Expired</h1>
          <p style="color: #a0a0a0;">This verification link has expired or is invalid.</p>
          <a href="https://mern-frontend-alpha-beige.vercel.app/signup" style="color: #7c3aed;">Sign up again</a>
        </div>
      `)
    }

    user.isVerified         = true
    user.verificationToken  = ''
    user.verificationExpiry = null
    await user.save()

    await sendWelcomeEmail(user.email, user.name)

    res.redirect('https://mern-frontend-alpha-beige.vercel.app/login?verified=true')

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' })
    }

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, activeMode: user.activeMode, isSeller: user.isSeller
      }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { phone, address, avatar } = req.body

    if (phone) {
      const phoneRegex = /^[0-9]{10}$/
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Phone must be exactly 10 digits' })
      }
    }
    if (address && address.trim().length < 5) {
      return res.status(400).json({ message: 'Address must be at least 5 characters' })
    }
    if (address && address.trim().length > 100) {
      return res.status(400).json({ message: 'Address must be less than 100 characters' })
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { phone, address, avatar, isProfileComplete: true },
      { new: true }
    ).select('-password')

    res.status(200).json({ message: 'Profile updated', user: updated })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/become-seller
export const becomeSeller = async (req, res) => {
  try {
    const { shopName, shopDescription, shopLogo } = req.body

    if (!shopName || shopName.trim().length < 2) {
      return res.status(400).json({ message: 'Shop name must be at least 2 characters' })
    }
    if (!shopDescription || shopDescription.trim().length < 10) {
      return res.status(400).json({ message: 'Shop description must be at least 10 characters' })
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        isSeller: true, role: 'seller', activeMode: 'seller',
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim(),
        shopLogo: shopLogo || ''
      },
      { new: true }
    ).select('-password')

    res.status(200).json({ message: 'You are now a seller!', user: updated })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/auth/switch-mode
export const switchMode = async (req, res) => {
  try {
    const { mode } = req.body

    if (!['buyer', 'seller'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode' })
    }
    if (mode === 'seller' && !req.user.isSeller) {
      return res.status(400).json({ message: 'You are not a seller yet' })
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { activeMode: mode },
      { new: true }
    ).select('-password')

    res.status(200).json({ message: `Switched to ${mode} mode`, user: updated })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' })
    }

    const resetToken  = crypto.randomBytes(32).toString('hex')
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000)

    user.resetPasswordToken  = resetToken
    user.resetPasswordExpiry = resetExpiry
    await user.save()

    await sendPasswordResetEmail(email, user.name, resetToken)

    res.status(200).json({ message: 'Password reset link sent to your email' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params
    const { password } = req.body

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const user = await User.findOne({
      resetPasswordToken:  token,
      resetPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or expired' })
    }

    user.password            = await bcrypt.hash(password, 10)
    user.resetPasswordToken  = ''
    user.resetPasswordExpiry = null
    await user.save()

    res.status(200).json({ message: 'Password reset successful! You can now login.' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/auth/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist')

    res.status(200).json({ wishlist: user.wishlist })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const user = await User.findById(req.user._id)

    const alreadyExists = user.wishlist.some(
      id => id.toString() === productId
    )

    if (!alreadyExists) {
      user.wishlist.push(productId)
      await user.save()
    }

    res.status(200).json({ message: 'Added to wishlist' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/auth/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params

    const user = await User.findById(req.user._id)

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== productId
    )

    await user.save()

    res.status(200).json({ message: 'Removed from wishlist' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}