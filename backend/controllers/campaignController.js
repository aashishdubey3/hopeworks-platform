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
    const { title, description, goal, cause } = req.body;
    const user = req.user || req.ngo;

    if (!user) {
      return res.status(401).json({ message: 'Not authorized to create campaign' });
    }

    const userId = user._id || user.id;
    const uploadedImage = req.file ? req.file.path : null;

    const campaign = await Campaign.create({
      title,
      description,
      cause,
      goalAmount: goal,      
      imageUrl: uploadedImage, 
      goal: goal,            
      image: uploadedImage,   
      ngo: userId, 
      ngoId: userId, 
      host: user.name || "Verified NGO", 
      raisedAmount: 0, 
      raised: 0,
      status: 'active' // THE FIX: Defaulting to active so the dashboard sees it
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
    const userId = user._id || user.id; 
    
    const campaigns = await Campaign.find({
      $or: [
        { ngo: userId },
        { ngoId: userId }
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

    const campaignOwnerId = campaign.ngo || campaign.ngoId;
    const userId = user._id || user.id; 
    
    if (!campaignOwnerId || String(campaignOwnerId) !== String(userId)) {
      return res.status(401).json({ message: 'Not authorized to edit this campaign' });
    }

    const { title, description, goal, cause } = req.body;

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (cause) campaign.cause = cause;
    if (goal) {
      campaign.goalAmount = goal;
      campaign.goal = goal;
    }

    if (req.file) {
      campaign.imageUrl = req.file.path;
      campaign.image = req.file.path;
    }

    const updatedCampaign = await campaign.save();
    res.json(updatedCampaign);
  } catch (error) {
    console.error("Update Campaign Error:", error);
    res.status(500).json({ message: 'Server error updating campaign.', error: error.message });
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

    const campaignOwnerId = campaign.ngo || campaign.ngoId;
    const userId = user._id || user.id;
    
    if (!campaignOwnerId || String(campaignOwnerId) !== String(userId)) {
      return res.status(401).json({ message: 'Not authorized to delete this campaign' });
    }

    const raised = campaign.raisedAmount || campaign.raised || 0;
    if (raised > 1) {
      return res.status(403).json({ 
        message: `Financial Compliance Lock: This ledger has received funds (₹${raised}). Under Section 80G guidelines, active financial records cannot be permanently deleted. Please contact Admin.` 
      });
    }

    await campaign.deleteOne();
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    res.status(500).json({ message: 'Server error deleting campaign.', error: error.message });
  }
};