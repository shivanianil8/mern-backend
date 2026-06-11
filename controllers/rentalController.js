import Rental from '../models/rental.js'
import Product from '../models/product.js'

// POST /api/rentals
export const createRental = async (req, res) => {
  try {
    const { productId, duration } = req.body

    if (!productId || !duration) {
      return res.status(400).json({ message: 'Product and duration are required' })
    }

    if (Number(duration) <= 0) {
      return res.status(400).json({ message: 'Duration must be greater than 0' })
    }

    const product = await Product.findById(productId)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (!product.rentAvailable) {
      return res.status(400).json({ message: 'This product is not available for rent' })
    }

    if (product.addedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rent your own product' })
    }

    const totalPrice = product.rentPrice * Number(duration)

    const daysToAdd = product.rentPer === 'week'
      ? Number(duration) * 7
      : Number(duration)

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysToAdd)

    const rental = await Rental.create({
      product:    productId,
      renter:     req.user._id,
      seller:     product.addedBy,
      duration:   Number(duration),
      rentPer:    product.rentPer,
      totalPrice,
      endDate
    })

    const populated = await Rental.findById(rental._id)
      .populate('product', 'name image price')
      .populate('seller', 'name email')

    res.status(201).json({ message: 'Rental created', rental: populated })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/rentals/my
export const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ renter: req.user._id })
      .populate('product', 'name image price rentPer')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({ rentals })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/rentals/incoming
export const getIncomingRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({ seller: req.user._id })
      .populate('product', 'name image price rentPer')
      .populate('renter', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({ rentals })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}