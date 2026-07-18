import express from 'express';
import { 
  registerNgo, 
  registerDonor,
  loginNgo, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  resendOtp
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerNgo);
router.post('/donor-signup', registerDonor);
router.post('/verify-email', verifyEmail); 
router.post('/login', loginNgo);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password/:token', resetPassword); 
router.post('/resend-otp', resendOtp);

export default router;