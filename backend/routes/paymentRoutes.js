import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; 
import { 
  createOrder, 
  verifyPayment,
  getMyDonations // <-- Added the new dashboard function
} from '../controllers/paymentController.js';

const router = express.Router();

// 1. Dashboard Route (Protected - requires the user to be logged in)
router.get('/my', protect, getMyDonations);

// 2. Razorpay Checkout Routes (Kept exactly as you had them)
router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;