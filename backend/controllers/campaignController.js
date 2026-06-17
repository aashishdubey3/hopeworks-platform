import Campaign from '../models/Campaign.js';

// @desc    Get all public campaigns (for the public directory)
// @route   GET /api/campaigns
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error("Fetch Campaigns Error:", error);
    res.status(500).json({ message: 'Server error fetching campaigns.' });
  }
};

// @desc    Get single campaign by ID (for the donation page)
// @route   GET /api/campaigns/:id
export const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (campaign) {
      res.json(campaign);
    } else {
      res.status(404).json({ message: 'Campaign not found' });
    }
  } catch (error) {
    console.error("Fetch Single Campaign Error:", error);
    res.status(500).json({ message: 'Server error fetching campaign.' });
  }
};

// @desc    Create a new campaign
// @route   POST /api/campaigns
export const createCampaign = async (req, res) => {
  try {
    // 1. Pull the text fields from the frontend FormData
    const { title, description, goal, cause } = req.body;
    const user = req.user || req.ngo;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized to create campaign' });
    }

    // 2. Pull the secure Cloudinary URL provided by Multer
    const uploadedImage = req.file ? req.file.path : null;

    // 3. Save to database using the EXACT keys your Schema expects!
    const campaign = await Campaign.create({
      title,
      description,
      cause,
      
      // FIX: Mapping to the strict schema names that caused the crash
      goalAmount: goal,      
      imageUrl: uploadedImage, 
      
      // Keeping the shorter names just in case your frontend relies on them
      goal: goal,             
      image: uploadedImage,   
      
      ngo: user._id, 
      ngoId: user._id, 
      host: user.name || "Verified NGO", 
      
      raisedAmount: 0, 
      raised: 0
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error("Create Campaign Error:", error);
    res.status(500).json({ message: 'Server error creating campaign.' });
  }
};

// @desc    Get campaigns belonging to the logged in NGO (for the Dashboard)
// @route   GET /api/campaigns/my
export const getMyCampaigns = async (req, res) => {
  try {
    const user = req.user || req.ngo;
    
    const campaigns = await Campaign.find({
      $or: [
        { ngo: user._id },
        { ngoId: user._id }
      ]
    }).sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    console.error("Fetch My Campaigns Error:", error);
    res.status(500).json({ message: 'Server error fetching your campaigns.' });
  }
};

// @desc    Get campaigns by specific NGO ID (for the Public Profile)
// @route   GET /api/campaigns/ngo/:id
export const getCampaignsByNgoId = async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      $or: [{ ngo: req.params.id }, { ngoId: req.params.id }]
    }).sort({ createdAt: -1 });
    
    res.json(campaigns);
  } catch (error) {
    console.error("Fetch NGO Campaigns Error:", error);
    res.status(500).json({ message: "Server error fetching NGO campaigns" });
  }
};
// @desc    Update an existing campaign
// @route   PUT /api/campaigns/:id
export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    const user = req.user || req.ngo;

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Security: Only the NGO who created it can edit it
    if (campaign.ngo.toString() !== user._id.toString() && campaign.ngoId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to edit this campaign' });
    }

    const { title, description, goal, cause } = req.body;

    // Update text fields if they exist
    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (cause) campaign.cause = cause;
    if (goal) {
      campaign.goalAmount = goal;
      campaign.goal = goal;
    }

    // Update image ONLY if a new one was uploaded
    if (req.file) {
      campaign.imageUrl = req.file.path;
      campaign.image = req.file.path;
    }

    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } catch (error) {
    console.error("Update Campaign Error:", error);
    res.status(500).json({ message: 'Server error updating campaign.' });
  }
};

// @desc    Delete a campaign (WITH FINANCIAL COMPLIANCE LOCK)
// @route   DELETE /api/campaigns/:id
export const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    const user = req.user || req.ngo;

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // BULLETPROOF OWNERSHIP CHECK (Safely handles old or missing data)
    const campaignOwnerId = campaign.ngo || campaign.ngoId;
    
    // If there is no owner ID, or if the ID doesn't match the logged-in user, reject it.
    // Using String() prevents the app from crashing if the data is undefined.
    if (!campaignOwnerId || String(campaignOwnerId) !== String(user._id)) {
      return res.status(401).json({ message: 'Not authorized to delete this campaign' });
    }

    // THE FINANCIAL COMPLIANCE LOCK
    const raised = campaign.raisedAmount || campaign.raised || 0;
    if (raised > 1) {
      return res.status(403).json({ 
        message: `Financial Compliance Lock: This ledger has received funds (₹${raised}). Under Section 80G guidelines, active financial records cannot be permanently deleted. Please contact Admin.` 
      });
    }

    // Use deleteOne() instead of the deprecated remove()
    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    res.status(500).json({ message: 'Server error deleting campaign.', error: error.message });
  }
};