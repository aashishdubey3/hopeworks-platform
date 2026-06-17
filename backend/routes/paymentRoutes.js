import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; 
import { 
  createOrder, 
  verifyPayment,
  getMyDonations,
  getNgoDonations, // <-- NEW
  getAllDonations  // <-- NEW
} from '../controllers/paymentController.js';

const router = express.Router();

// 1. Dashboard Routes 
router.get('/my', protect, getMyDonations);
router.get('/ngo-donations', protect, getNgoDonations); // For NGO Creator Studio
router.get('/all-donations', getAllDonations);          // For Admin Panel

// 2. Razorpay Checkout Routes
router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;