import express from 'express';
import { 
  createCampaign, 
  getCampaigns, 
  getCampaignById, 
  getMyCampaigns,
  getCampaignsByNgoId,
  updateCampaign,     
  deleteCampaign      
} from '../controllers/campaignController.js'; 

import upload from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. PUBLIC ROUTES
router.get('/', getCampaigns); 

// 2. PROTECTED NGO ROUTES (Must come before /:id)
router.get('/my', protect, getMyCampaigns); 
router.get('/ngo/:id', getCampaignsByNgoId);

// CRITICAL: upload.single('image') intercepts the file and sends it to Cloudinary
router.post('/', protect, upload.single('image'), createCampaign);

// 3. DYNAMIC ID ROUTES (Must stay at the bottom!)
router.get('/:id', getCampaignById);

// Edit & Delete Routes with protection and image handling
router.put('/:id', protect, upload.single('image'), updateCampaign);
router.delete('/:id', protect, deleteCampaign);

export default router;