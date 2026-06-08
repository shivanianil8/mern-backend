import express from 'express'
import {
  addProduct,
  getProducts,
  editProduct,
  deleteProduct
} from '../controllers/productController.js'
import protect from '../middleware/authMiddleware.js'

const productRoutes = express.Router()

productRoutes.post('/',     protect, addProduct)    // protected
productRoutes.get('/',              getProducts)    // public
productRoutes.put('/:id',   protect, editProduct)   // protected
productRoutes.delete('/:id', protect, deleteProduct) // protected

export default productRoutes