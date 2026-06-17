import crypto from 'crypto';
import razorpayInstance from '../config/razorpay.js';
import Donor from '../models/Donor.js';
import Campaign from '../models/Campaign.js';
import Ngo from '../models/Ngo.js';
import { generateAndUpload80GReceipt } from '../utils/pdfGenerator.js';
import { sendReceiptEmail } from '../utils/emailService.js'; // <-- Added Email Import

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
    
    const targetNgoId = campaign.ngo || campaign.ngoId; // Smart lookup

    // 3. Save the legitimate donor to the database FIRST
    const newDonor = await Donor.create({
      name: donorInfo.name,
      email: donorInfo.email,
      amount: donorInfo.amount,
      pan: donorInfo.pan, // <-- Added PAN for legal 80G compliance!
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      campaignId: campaignId
    });

    // 4. Increment campaign total (using 'raised', matching your React frontend)
    campaign.raised = (campaign.raised || 0) + donorInfo.amount;
    await campaign.save();

    // 5. --- THE PDF & EMAIL AUTOMATION ---
    let receiptUrl = null;
    const receivingNgo = await Ngo.findById(targetNgoId);
      
    if (receivingNgo) {
      try {
        // Generate the PDF and get the Cloudinary URL back
        receiptUrl = await generateAndUpload80GReceipt(newDonor, receivingNgo);
        
        // Save that URL back into the Donor's database record
        newDonor.taxReceiptUrl = receiptUrl; // or receiptUrl depending on your schema
        await newDonor.save();
        console.log(`✅ 80G Receipt Generated and Uploaded: ${receiptUrl}`);

        // FIRE THE EMAIL (Runs in background so user doesn't wait)
        sendReceiptEmail(
          donorInfo.email, 
          donorInfo.name, 
          receivingNgo.name, 
          donorInfo.amount, 
          receiptUrl
        );

      } catch (pdfOrEmailError) {
        // This is the golden log! If pdfkit crashes, we will see EXACTLY why right here.
        console.error("⚠️ PDF or Email Engine Failed:", pdfOrEmailError);
      }
    }

    // 6. Send success response back to frontend
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
// @desc    Get logged in user's donation history
// @route   GET /api/payments/my
export const getMyDonations = async (req, res) => {
  try {
    // Find all donation records where the user matches the logged-in token
    // We use .populate() to pull in the Campaign title and image to display on the frontend
    const donations = await Donor.find({ user: req.user._id })
      .populate('campaign', 'title image ngo')
      .sort({ createdAt: -1 }); // Sort by newest first
      
    res.json(donations);
  } catch (error) {
    console.error("Fetch My Donations Error:", error);
    res.status(500).json({ message: 'Server error fetching donation history.' });
  }
};