import express from 'express'
import {
  userSign,
  userLogin,
  updateProfile,
  getProfile,
  becomeSeller,
  switchMode
} from '../controllers/userController.js'
import protect from '../middleware/authMiddleware.js'

const authRoutes = express.Router()

authRoutes.post('/signup',        userSign)
authRoutes.post('/login',         userLogin)
authRoutes.get('/profile',        protect, getProfile)
authRoutes.put('/profile',        protect, updateProfile)
authRoutes.post('/become-seller', protect, becomeSeller)
authRoutes.put('/switch-mode',    protect, switchMode)

export default authRoutes