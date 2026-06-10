import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Profile
  phone:    { type: String, default: '' },
  address:  { type: String, default: '' },
  avatar:   { type: String, default: '' },
  isProfileComplete: { type: Boolean, default: false },

  // Email verification
  isVerified:         { type: Boolean, default: false },
  verificationToken:  { type: String, default: '' },
  verificationExpiry: { type: Date },

  // Role system
  role:       { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
  activeMode: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },

  // Seller info
  shopName:        { type: String, default: '' },
  shopDescription: { type: String, default: '' },
  shopLogo:        { type: String, default: '' },
  isSeller:        { type: Boolean, default: false }

}, { timestamps: true })

export default mongoose.model('User', userSchema)