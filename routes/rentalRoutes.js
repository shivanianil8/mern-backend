import express from 'express'
import protect from '../middleware/authMiddleware.js'
import {
  createRental,
  getMyRentals,
  getIncomingRentals
} from '../controllers/rentalController.js'

const rentalRoutes = express.Router()

rentalRoutes.post('/',          protect, createRental)
rentalRoutes.get('/my',         protect, getMyRentals)
rentalRoutes.get('/incoming',   protect, getIncomingRentals)

export default rentalRoutes