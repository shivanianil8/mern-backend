import mongoose from 'mongoose'

const swapSchema = new mongoose.Schema(
  {
    requestedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    offeredProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
)

export default mongoose.model('Swap', swapSchema)