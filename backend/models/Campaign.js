import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  description: { type: String, required: true },
  proofImageUrl: { type: String, required: true }, // E.g., Photo of the whiteboards
  completedAt: { type: Date, default: Date.now }
});

const campaignSchema = new mongoose.Schema({
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ngo', required: true, index: true },
  host: { type: String, required: true }, // e.g., "The Lantern Library"
  title: { type: String, required: true },
  description: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  imageUrl: { type: String, required: true }, // Main campaign banner
  milestones: [milestoneSchema], // The Transparency Tracker!
  isLocked: { type: Boolean, default: false } // Locks if they reach the goal but haven't posted proof
}, { timestamps: true });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;