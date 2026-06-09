import express from 'express'
import {
  addProduct,
  getProducts,
  editProduct,
  deleteProduct
} from '../controllers/productController.js'
import protect from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'

const productRoutes = express.Router()

productRoutes.post('/',      protect, upload.single('image'), addProduct)
productRoutes.get('/',                                        getProducts)
productRoutes.put('/:id',    protect, upload.single('image'), editProduct)
productRoutes.delete('/:id', protect,                         deleteProduct)

export default productRoutes