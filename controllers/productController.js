import Product from '../models/product.js'

// POST /api/products
export const addProduct = async (req, res) => {
  try {
    const {
      name, price, description, category,
      openToSwap, swapPreferences
    } = req.body

    if (!name || !price || !description || !category) {
      return res.status(400).json({
        message: 'Name, price, description and category are required'
      })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({
        message: 'Product name must be at least 2 characters'
      })
    }
    if (name.trim().length > 100) {
      return res.status(400).json({
        message: 'Product name must be less than 100 characters'
      })
    }
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        message: 'Price must be a positive number'
      })
    }

    const image = req.file ? req.file.path : ''

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      category,
      image,
      openToSwap: openToSwap === true || openToSwap === "true",
      swapPreferences: swapPreferences?.trim() || "",
      addedBy: req.user._id
    })

    res.status(201).json({ message: 'Product added', product })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({ products })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('addedBy', 'name email')

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.status(200).json({ product })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// PUT /api/products/:id
export const editProduct = async (req, res) => {
  try {
    const {
      name, price, description, category,
      openToSwap, swapPreferences
    } = req.body

    if (!name || !price || !description || !category) {
      return res.status(400).json({
        message: 'Name, price, description and category are required'
      })
    }
    if (name.trim().length < 2) {
      return res.status(400).json({
        message: 'Product name must be at least 2 characters'
      })
    }
    if (isNaN(price) || Number(price) <= 0) {
      return res.status(400).json({
        message: 'Price must be a positive number'
      })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    if (product.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not your product' })
    }

    const image = req.file ? req.file.path : product.image

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        category,
        image,
        openToSwap: openToSwap === true || openToSwap === "true",
        swapPreferences: swapPreferences?.trim() || ""
      },
      { new: true }
    )

    res.status(200).json({ message: 'Product updated', product: updated })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    if (product.addedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not your product' })
    }

    await Product.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: 'Product deleted' })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}