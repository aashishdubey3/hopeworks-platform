import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ngo'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);