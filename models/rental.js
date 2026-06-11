import mongoose from 'mongoose'

const rentalSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration:   { type: Number, required: true },
  rentPer:    { type: String, enum: ['day', 'week'], required: true },
  totalPrice: { type: Number, required: true },
  startDate:  { type: Date, default: Date.now },
  endDate:    { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true })

export default mongoose.model('Rental', rentalSchema)