import express from 'express';

import { 
  loginAdmin,
  getAllNgos, 
  toggleNgoStatus, 
  getAllCampaigns, 
  deleteCampaign,
  getAllCsrInquiries, 
  toggleCsrStatus, 
  getContactMessages

} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Route (Used to generate the Admin Token)
router.post('/login', loginAdmin);

// Protected Admin Dashboard Routes
router.get('/ngos', verifyAdmin, getAllNgos);
router.put('/ngo/:id/status', verifyAdmin, toggleNgoStatus);
router.get('/campaigns', verifyAdmin, getAllCampaigns);
router.get('/messages', verifyAdmin, getContactMessages);
router.delete('/campaign/:id', verifyAdmin, deleteCampaign);

// Protected CSR Routes
router.get('/csr', verifyAdmin, getAllCsrInquiries);
router.put('/csr/:id/status', verifyAdmin, toggleCsrStatus);

export default router;