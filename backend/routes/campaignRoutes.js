import express from 'express';
import { 
  createCampaign, 
  getCampaigns, 
  getCampaignById, 
  getMyCampaigns,
  getCampaignsByNgoId,
  updateCampaign,     // <-- Imported
  deleteCampaign      // <-- Imported
} from '../controllers/campaignController.js'; 
import upload from '../Middleware/uploadMiddleware.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. PUBLIC ROUTES
router.get('/', getCampaigns); 

// 2. PROTECTED NGO ROUTES
router.get('/my', protect, getMyCampaigns); 

// CRITICAL: upload.single('image') intercepts the file and sends it to Cloudinary
router.post('/', protect, upload.single('image'), createCampaign);

// 3. NGO PUBLIC PROFILE ROUTE (Must come before /:id)
router.get('/ngo/:id', getCampaignsByNgoId);

// 4. DYNAMIC ID ROUTES (Must stay at the bottom!)
router.get('/:id', getCampaignById);

// NEW: Edit & Delete Routes with protection and image handling
router.put('/:id', protect, upload.single('image'), updateCampaign);
router.delete('/:id', protect, deleteCampaign);

export default router;