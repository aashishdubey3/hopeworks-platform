import mongoose from 'mongoose';

const csrInquirySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    budget: { type: Number, required: true },
    focusArea: { type: String, required: true },
    status: { type: String, default: 'Pending Review' }
  },
  { timestamps: true }
);

const CsrInquiry = mongoose.model('CsrInquiry', csrInquirySchema);
export default CsrInquiry;