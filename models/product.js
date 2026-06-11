import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Electronics', 'Clothing', 'Food', 'Books', 'Furniture', 'Sports', 'Beauty', 'Other'],
    default: 'Other'
  },
  openToSwap:      { type: Boolean, default: false },
  swapPreferences: { type: String, default: '' },
  rentAvailable:   { type: Boolean, default: false },
  rentPrice:       { type: Number, default: 0 },
  rentPer:         { type: String, enum: ['day', 'week'], default: 'day' },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

export default mongoose.model('Product', productSchema)