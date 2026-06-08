import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'  // ← add this

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)   // ← add this

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err))

app.get('/', (req, res) => {
  res.send('Backend is running')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})