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

// 2. PROTECTED ROUTES (MUST COME BEFORE ANY /:id ROUTES)
// This guarantees that a request to '/my' goes to getMyCampaigns and not getCampaignById
router.get('/my', protect, getMyCampaigns); 
router.post('/', protect, upload.single('image'), createCampaign);

// 3. NGO PUBLIC PROFILE ROUTE 
router.get('/ngo/:id', getCampaignsByNgoId);

// 4. DYNAMIC ID ROUTES (MUST BE AT THE VERY BOTTOM!)
// Edit & Delete Routes
router.put('/:id', protect, upload.single('image'), updateCampaign);
router.delete('/:id', protect, deleteCampaign);

// Get Single Campaign Route (Must be the absolute last GET request!)
router.get('/:id', getCampaignById);

export default router;