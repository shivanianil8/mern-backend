import express from 'express'
import protect from '../middleware/authMiddleware.js'

const rentalRoutes = express.Router()

// Temporary placeholder routes

rentalRoutes.get('/', protect, (req, res) => {
  res.status(200).json({
    message: 'Rental routes working'
  })
})

rentalRoutes.post('/', protect, (req, res) => {
  res.status(200).json({
    message: 'Create rental route working'
  })
})

export default rentalRoutes