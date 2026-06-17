import CsrInquiry from '../models/CsrInquiry.js';

// @desc    Submit a new CSR inquiry
// @route   POST /api/csr/inquiry
export const submitCsrInquiry = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, budget, focusArea } = req.body;

    const newInquiry = await CsrInquiry.create({
      companyName,
      contactName,
      email,
      phone,
      budget,
      focusArea
    });

    res.status(201).json({ 
      success: true, 
      message: 'Inquiry received. Our enterprise partnership team will contact you shortly.', 
      data: newInquiry 
    });
  } catch (error) {
    console.error("CSR Inquiry Error:", error);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry.' });
  }
};