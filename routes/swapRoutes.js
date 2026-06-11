import express from 'express'
import protect from '../middleware/authMiddleware.js'
import {
  createSwapRequest,
  getMySwapRequests,
  updateSwapStatus
} from '../controllers/swapController.js'

const swapRoutes = express.Router()

// Create swap request
swapRoutes.post('/', protect, createSwapRequest)

// Incoming + outgoing requests
swapRoutes.get('/', protect, getMySwapRequests)

// Accept / Reject
swapRoutes.put('/:id', protect, updateSwapStatus)

export default swapRoutes