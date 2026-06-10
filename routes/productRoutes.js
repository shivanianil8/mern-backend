import express from 'express'
import {
  addProduct,
  getProducts,
  getProductById,
  editProduct,
  deleteProduct
} from '../controllers/productController.js'

import protect from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'

const productRoutes = express.Router()

// Add Product
productRoutes.post(
  '/',
  protect,
  upload.single('image'),
  addProduct
)

// Get All Products
productRoutes.get('/', getProducts)

// Get Single Product
productRoutes.get('/:id', getProductById)

// Edit Product
productRoutes.put(
  '/:id',
  protect,
  upload.single('image'),
  editProduct
)

// Delete Product
productRoutes.delete(
  '/:id',
  protect,
  deleteProduct
)

export default productRoutes