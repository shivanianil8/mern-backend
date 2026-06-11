import express from 'express'
import protect from '../middleware/authMiddleware.js'
import {
  createOrder,
  getMyOrders,
  getIncomingOrders,
  updateOrderStatus
} from '../controllers/orderController.js'

const orderRoutes = express.Router()

orderRoutes.post('/',              protect, createOrder)
orderRoutes.get('/my',             protect, getMyOrders)
orderRoutes.get('/incoming',       protect, getIncomingOrders)
orderRoutes.put('/:id/status',     protect, updateOrderStatus)

export default orderRoutes