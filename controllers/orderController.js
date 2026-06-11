import Order from '../models/order.js'
import Product from '../models/product.js'

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    // Group items by seller
    const sellerMap = {}

    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` })
      }

      const sellerId = product.addedBy.toString()

      if (!sellerMap[sellerId]) {
        sellerMap[sellerId] = []
      }

      sellerMap[sellerId].push({
        product:  product._id,
        name:     product.name,
        price:    product.price,
        image:    product.image,
        quantity: item.quantity || 1
      })
    }

    // Create one order per seller
    const orders = []

    for (const [sellerId, orderItems] of Object.entries(sellerMap)) {
      const totalPrice = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      )

      const order = await Order.create({
        buyer:           req.user._id,
        seller:          sellerId,
        items:           orderItems,
        totalPrice,
        deliveryAddress: deliveryAddress || ''
      })

      orders.push(order)
    }

    res.status(201).json({ message: 'Order placed!', orders })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/orders/my
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('seller', 'name email shopName')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })

    res.status(200).json({ orders })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/orders/incoming
export const getIncomingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate('buyer', 'name email')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })

    res.status(200).json({ orders })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    order.status = status
    await order.save()

    res.status(200).json({ message: `Order ${status}`, order })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}