import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  image: {
    type: String,
    default: ''
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: [
      'Electronics',
      'Clothing',
      'Food',
      'Books',
      'Furniture',
      'Sports',
      'Beauty',
      'Other'
    ],
    required: true
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)