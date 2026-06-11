import Swap from '../models/swap.js'
import Product from '../models/product.js'

// Create Swap Request
export const createSwapRequest = async (req, res) => {
  try {
    const { requestedProduct, offeredProduct } = req.body

    const requested = await Product.findById(requestedProduct)
    const offered = await Product.findById(offeredProduct)

    if (!requested || !offered) {
      return res.status(404).json({
        message: 'Product not found'
      })
    }

    if (!requested.openToSwap) {
      return res.status(400).json({
        message: 'This product is not open for swaps'
      })
    }

    const existing = await Swap.findOne({
      requestedProduct,
      offeredProduct,
      requester: req.user._id,
      status: 'pending'
    })

    if (existing) {
      return res.status(400).json({
        message: 'Swap request already sent'
      })
    }

    const swap = await Swap.create({
      requestedProduct,
      offeredProduct,
      requester: req.user._id,
      seller: requested.addedBy
    })

    res.status(201).json({
      message: 'Swap request sent',
      swap
    })

  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
}

// Get My Swap Requests
export const getMySwapRequests = async (req, res) => {
  try {
    const incoming = await Swap.find({
      seller: req.user._id
    })
      .populate('requestedProduct')
      .populate('offeredProduct')
      .populate('requester', 'name email')
      .sort({ createdAt: -1 })

    const outgoing = await Swap.find({
      requester: req.user._id
    })
      .populate('requestedProduct')
      .populate('offeredProduct')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      incoming,
      outgoing
    })

  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
}

// Accept / Reject Swap
export const updateSwapStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status'
      })
    }

    const swap = await Swap.findById(req.params.id)

    if (!swap) {
      return res.status(404).json({
        message: 'Swap request not found'
      })
    }

    if (swap.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: 'Unauthorized'
      })
    }

    swap.status = status
    await swap.save()

    res.status(200).json({
      message: `Swap ${status}`,
      swap
    })

  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
}