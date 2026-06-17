import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Ngo'
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  host: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('News', newsSchema);