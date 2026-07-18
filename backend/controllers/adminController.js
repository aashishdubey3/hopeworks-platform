import Ngo from '../models/Ngo.js';
import Campaign from '../models/Campaign.js';
import CsrInquiry from '../models/CsrInquiry.js';
import jwt from 'jsonwebtoken';

// @desc    Admin Login
// @route   POST /api/admin/login
export const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  // Verify against the secure environment variables
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    
    // Generate a token specifically tagged with the 'admin' role
    const token = jwt.sign(
      { role: 'admin', email: process.env.ADMIN_EMAIL }, 
      process.env.JWT_SECRET, 
      { expiresIn: '12h' }
    );

    return res.status(200).json({ 
      message: 'Admin login successful', 
      token 
    });
  } else {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

// @desc    Get all NGOs
// @route   GET /api/admin/ngos
export const getAllNgos = async (req, res) => {
  try {
    const ngos = await Ngo.find({}).select('-password').sort({ createdAt: -1 });
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching NGOs" });
  }
};

// @desc    Approve Pending NGO, or Ban/Unban an Active NGO
// @route   PUT /api/admin/ngo/:id/status
export const toggleNgoStatus = async (req, res) => {
  try {
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    // Ensure backwards compatibility with older NGO records
    if (!ngo.status) ngo.status = 'pending';
    if (typeof ngo.isBanned === 'undefined') ngo.isBanned = false;

    // The clear, explicit logic tree:
    if (ngo.status === 'pending') {
      // 1. Initial Approval
      ngo.status = 'approved';
      ngo.isBanned = false;
      await ngo.save();
      return res.json({ message: "NGO Officially Verified & Approved", ngo });
    } else if (!ngo.isBanned) {
      // 2. Suspend an Active NGO
      ngo.isBanned = true;
      // We do not change 'status' away from 'approved' because they are still a registered entity, just currently suspended.
      await ngo.save();
      return res.json({ message: "NGO Suspended successfully", ngo });
    } else {
      // 3. Reinstate a Suspended NGO
      ngo.isBanned = false;
      await ngo.save();
      return res.json({ message: "NGO Reinstated successfully", ngo });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error updating NGO status" });
  }
};

// @desc    Get all platform campaigns
// @route   GET /api/admin/campaigns
export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching campaigns" });
  }
};

// @desc    Delete a fraudulent campaign
// @route   DELETE /api/admin/campaign/:id
export const deleteCampaign = async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ message: "Campaign completely removed from platform." });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting campaign" });
  }
};

// ==========================================
// NEW: CSR LEAD MANAGEMENT
// ==========================================

// @desc    Get all CSR Inquiries
// @route   GET /api/admin/csr
export const getAllCsrInquiries = async (req, res) => {
  try {
    const inquiries = await CsrInquiry.find({}).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching CSR inquiries" });
  }
};

// @desc    Cycle CSR Status (Pending -> Contacted -> Funded -> Archived)
// @route   PUT /api/admin/csr/:id/status
export const toggleCsrStatus = async (req, res) => {
  try {
    const inquiry = await CsrInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });

    // The official Enterprise Pipeline cycle
    const statuses = ['Pending Review', 'Contacted', 'Funded', 'Archived'];
    
    // Find where we currently are in the cycle, and move to the next one
    const currentIndex = statuses.indexOf(inquiry.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    
    inquiry.status = statuses[nextIndex];
    await inquiry.save();

    res.json({ message: `Status updated to ${inquiry.status}`, inquiry });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
};
import ContactMessage from '../models/ContactMessage.js';

// @desc    Get all contact/feedback messages
// @route   GET /api/admin/messages
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching messages" });
  }
};