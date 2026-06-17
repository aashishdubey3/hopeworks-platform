import Ngo from '../models/Ngo.js';
import Campaign from '../models/Campaign.js';
import CsrInquiry from '../models/CsrInquiry.js'; // <-- NEW: Import the CSR model

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

    // If it's a new application, the first click Approves it.
    if (ngo.status === 'pending') {
      ngo.status = 'approved';
      await ngo.save();
      return res.json({ message: "NGO Officially Verified & Approved", ngo });
    } 
    
    // If it's already approved, the click Toggles the Ban status.
    ngo.isBanned = !ngo.isBanned;
    await ngo.save();

    res.json({ message: `NGO ${ngo.isBanned ? 'suspended' : 'reinstated'} successfully`, ngo });
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