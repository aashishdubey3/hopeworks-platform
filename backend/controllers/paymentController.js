import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Donor from '../models/Donor.js';
import Campaign from '../models/Campaign.js';
import Ngo from '../models/Ngo.js';
import { generateAndUpload80GReceipt } from '../utils/pdfGenerator.js';
import { sendReceiptEmail } from '../utils/emailService.js'; 

// @desc    Create a Razorpay Order
// @route   POST /api/payments/order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: "Could not create order", error: error.message });
  }
};

// @desc    Verify Razorpay Payment & Save Donor
// @route   POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donorInfo, campaignId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !donorInfo || !campaignId) {
      return res.status(400).json({ message: "Missing payment or campaign details" });
    }

    // 1. Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    // 2. Fetch Campaign to find the NGO Owner
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    const targetNgoId = campaign.ngo || campaign.ngoId;

    // 3. Save the legitimate donor to the database FIRST
    const newDonor = await Donor.create({
      name: donorInfo.name,
      email: donorInfo.email,
      amount: donorInfo.amount,
      pan: donorInfo.pan, 
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      campaignId: campaignId
    });

    // 4. Increment campaign total
    campaign.raised = (campaign.raised || 0) + donorInfo.amount;
    await campaign.save();

    // 5. --- THE PDF & EMAIL AUTOMATION ---
    let receiptUrl = null;
    const receivingNgo = await Ngo.findById(targetNgoId);
      
    if (receivingNgo) {
      try {
        receiptUrl = await generateAndUpload80GReceipt(newDonor, receivingNgo);
        newDonor.taxReceiptUrl = receiptUrl; 
        await newDonor.save();
        console.log(`✅ 80G Receipt Generated and Uploaded: ${receiptUrl}`);

        sendReceiptEmail(
          donorInfo.email, 
          donorInfo.name, 
          receivingNgo.name, 
          donorInfo.amount, 
          receiptUrl
        );

      } catch (pdfOrEmailError) {
        console.error("⚠️ PDF or Email Engine Failed:", pdfOrEmailError);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Payment verified.", 
      receiptUrl: receiptUrl 
    });

  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Payment verified but failed to save details." });
  }
};

// @desc    Get logged in user's donation history (For Donor Dashboard)
// @route   GET /api/payments/my
export const getMyDonations = async (req, res) => {
  try {
    const donations = await Donor.find({ user: req.user._id })
      .populate('campaign', 'title image ngo')
      .sort({ createdAt: -1 }); 
      
    res.json(donations);
  } catch (error) {
    console.error("Fetch My Donations Error:", error);
    res.status(500).json({ message: 'Server error fetching donation history.' });
  }
};

// ==================================================================
// NEW: NGO CREATOR STUDIO LEDGER
// ==================================================================

// @desc    Get all donations for a specific NGO's campaigns
// @route   GET /api/payments/ngo-donations
export const getNgoDonations = async (req, res) => {
  try {
    const user = req.user || req.ngo;
    if (!user) return res.status(401).json({ message: "Not authorized" });

    // 1. Find all campaigns owned by this NGO
    const campaigns = await Campaign.find({
      $or: [{ ngo: user._id }, { ngoId: user._id }]
    });
    
    // Map them to strings for a safe database search
    const campaignIds = campaigns.map(c => c._id.toString());

    // 2. Find all donors who donated to any of these campaign IDs
    const donations = await Donor.find({ campaignId: { $in: campaignIds } })
      .sort({ createdAt: -1 });

    // 3. Attach the readable campaign title and format the donor name for the frontend
    const enrichedDonations = donations.map(donor => {
      const camp = campaigns.find(c => c._id.toString() === String(donor.campaignId));
      return {
        ...donor.toObject(),
        campaignTitle: camp ? camp.title : 'Unknown Project',
        donorName: donor.name || 'Anonymous'
      };
    });

    res.json(enrichedDonations);
  } catch (error) {
    console.error("Fetch NGO Donations Error:", error);
    res.status(500).json({ message: 'Server error fetching NGO ledger.' });
  }
};

// ==================================================================
// NEW: ADMIN GLOBAL LEDGER
// ==================================================================

// @desc    Get ALL donations across the platform
// @route   GET /api/payments/all-donations
export const getAllDonations = async (req, res) => {
  try {
    const donations = await Donor.find({}).sort({ createdAt: -1 });
    
    // Format the donor name for the frontend table
    const enrichedDonations = donations.map(donor => ({
      ...donor.toObject(),
      donorName: donor.name || 'Anonymous'
    }));

    res.json(enrichedDonations);
  } catch (error) {
    console.error("Fetch All Donations Error:", error);
    res.status(500).json({ message: 'Server error fetching global donations.' });
  }
};