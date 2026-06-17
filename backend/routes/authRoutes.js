import express from 'express';
import { 
  registerNgo, 
  loginNgo, 
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  resendOtp // <--- THIS WAS THE MISSING PIECE!
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerNgo);
router.post('/verify-email', verifyEmail); 
router.post('/login', loginNgo);
router.post('/forgot-password', forgotPassword); 
router.post('/reset-password/:token', resetPassword); 
router.post('/resend-otp', resendOtp);

export default router;