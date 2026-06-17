import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  avatar: { type: String, default: "" },

  address: { type: String, required: true },
  cause: { type: String, required: true },
  description: { type: String },
  darpanId: { type: String },
  
  // === FINTECH COMPLIANCE FIELDS ===
  pan: { type: String, uppercase: true, trim: true }, // NGO's Permanent Account Number
  urn: { type: String, trim: true },                 // 80G Unique Registration Number
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  // === SECURITY & AUTH FIELDS ===
  isEmailVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  otpExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

// NOTE: The pre('save') password hashing hook was removed from here.
// All password hashing is strictly and securely handled inside authController.js to prevent double-hashing bugs.

const Ngo = mongoose.model('Ngo', ngoSchema);
export default Ngo;