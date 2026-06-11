import express from 'express'
import {
  userSign,
  userLogin,
  updateProfile,
  getProfile,
  becomeSeller,
  switchMode,
  verifyEmail,
  forgotPassword,
  resetPassword,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  uploadAvatar
} from '../controllers/userController.js'

import protect from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'

const authRoutes = express.Router()

authRoutes.post('/signup', userSign)
authRoutes.post('/login', userLogin)

authRoutes.get('/verify-email/:token', verifyEmail)

authRoutes.get('/profile', protect, getProfile)
authRoutes.put('/profile', protect, updateProfile)

authRoutes.post('/become-seller', protect, becomeSeller)
authRoutes.put('/switch-mode', protect, switchMode)

authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password/:token', resetPassword)

// Wishlist
authRoutes.get('/wishlist',              protect, getWishlist)
authRoutes.post('/wishlist/:productId',  protect, addToWishlist)
authRoutes.delete('/wishlist/:productId', protect, removeFromWishlist)

// Avatar upload
authRoutes.post('/upload-avatar', protect, upload.single('image'), uploadAvatar)

export default authRoutes