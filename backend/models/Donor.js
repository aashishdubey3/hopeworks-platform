import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentId: { type: String, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  date: { type: Date, default: Date.now },

  // === NEW AML AUDIT TRAIL FIELDS ===
  pan: { type: String, uppercase: true, trim: true }, // Collected for high-value tiers
  ipAddress: { type: String },                         // Immutable network footprint
  userAgent: { type: String },                         // Device signature fingerprint
  
  // Note: For advanced tracking, keep actual identification data securely segregated or tokenized
  identityVerified: { type: Boolean, default: false }
});
const Donor = mongoose.model('Donor', donorSchema);
export default Donor;