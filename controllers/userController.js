import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/signup
export const userSign = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Backend validation
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
    const user = await User.create({ name, email, password: hashed })

    res.status(201).json({
      message: 'Signup successful',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// POST /api/auth/login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body

    // Backend validation
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

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password' })
    }

    res.status(200).json({
      message: 'Login successful',
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email }
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { phone, address, avatar } = req.body

    // Backend validation
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
    if (avatar && avatar.length > 200) {
      return res.status(400).json({ message: 'Avatar URL too long' })
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

// GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    res.status(200).json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}