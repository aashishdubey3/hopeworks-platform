import express from 'express';

import { 
  getAllNgos, 
  toggleNgoStatus, 
  getAllCampaigns, 
  deleteCampaign,
  getAllCsrInquiries, // <-- ADDED THIS
  toggleCsrStatus     // <-- ADDED THIS
} from '../controllers/adminController.js';

const router = express.Router();

// Routes for the Admin Dashboard
router.get('/ngos', getAllNgos);
router.put('/ngo/:id/status', toggleNgoStatus);
router.get('/campaigns', getAllCampaigns);
router.delete('/campaign/:id', deleteCampaign);

// CSR Routes
router.get('/csr', getAllCsrInquiries);
router.put('/csr/:id/status', toggleCsrStatus);

export default router;