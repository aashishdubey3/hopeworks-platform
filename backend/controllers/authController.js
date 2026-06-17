import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Ngo from '../models/Ngo.js';
import { sendEmail } from '../utils/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new NGO & Send OTP
// @route   POST /api/auth/register
export const registerNgo = async (req, res) => {
  try {
    const { name, email, password, cause, description, darpanId, address } = req.body;

    const ngoExists = await Ngo.findOne({ email: email.toLowerCase() });
    if (ngoExists) return res.status(400).json({ message: 'NGO already exists with this email.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    const ngo = await Ngo.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      cause,
      description,
      darpanId,
      address,
      status: 'pending',
      isEmailVerified: false,
      verificationOTP: otp,
      otpExpires: otpExpires
    });

    // 2. Send the OTP via Email
    const emailMessage = `Welcome to HopeWorks! Your email verification code is: ${otp}. This code expires in 10 minutes.`;
    await sendEmail({ email: ngo.email, subject: 'HopeWorks - Verify Your Email', message: emailMessage });

    res.status(201).json({ message: 'Registration initiated. Please check your email for the 6-digit verification code.', email: ngo.email });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Verify Email via OTP
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const ngo = await Ngo.findOne({ email: email.toLowerCase() });
    if (!ngo) return res.status(400).json({ message: 'User not found.' });

    // Check if OTP matches and is not expired
    if (ngo.verificationOTP !== otp || ngo.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // Mark as verified and clear OTP fields
    ngo.isEmailVerified = true;
    ngo.verificationOTP = undefined;
    ngo.otpExpires = undefined;
    await ngo.save();

    res.status(200).json({ message: 'Email verified successfully! Please wait for Admin approval to log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification.' });
  }
};

// @desc    Authenticate NGO & get token (Login)
// @route   POST /api/auth/login
export const loginNgo = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });

    if (!ngo) return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, ngo.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    // --- SECURITY CHECKS ---
    if (!ngo.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    }
    if (ngo.status === 'pending') {
      return res.status(403).json({ message: 'Security Alert: Your account is awaiting Admin Verification. You cannot log in yet.' });
    }
    if (ngo.status === 'rejected') {
      return res.status(403).json({ message: 'Your application to join HopeWorks was declined by the administration.' });
    }
    if (ngo.status === 'deactivated') {
      return res.status(403).json({ message: 'This account has been deactivated.' });
    }

    // THE FIX: Included the avatar and extra status data in the payload
    res.status(200).json({
      _id: ngo._id,
      name: ngo.name,
      email: ngo.email,
      avatar: ngo.avatar, 
      token: generateToken(ngo._id),
      status: ngo.status,
      isBanned: ngo.isBanned
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Forgot Password (Generates Magic Link Token)
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });

    if (!ngo) return res.status(404).json({ message: 'No account found with that email.' });

    // Generate cryptographic token
    const resetToken = crypto.randomBytes(20).toString('hex');
    ngo.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    ngo.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await ngo.save();

    // Create reset URL (This points to your React frontend!)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click this link to set a new password: \n\n ${resetUrl} \n\n This link expires in 15 minutes.`;

    await sendEmail({ email: ngo.email, subject: 'HopeWorks - Password Reset', message });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    // Re-hash the token from the URL to find it in the DB
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const ngo = await Ngo.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() } // Ensure it hasn't expired
    });

    if (!ngo) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    ngo.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear tokens
    ngo.resetPasswordToken = undefined;
    ngo.resetPasswordExpires = undefined;
    await ngo.save();

    res.status(200).json({ message: 'Password successfully reset! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password.' });
  }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });
    if (!ngo) return res.status(404).json({ message: 'User not found.' });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    ngo.verificationOTP = otp;
    ngo.otpExpires = Date.now() + 10 * 60 * 1000;
    await ngo.save();

    // Send via your utility
    await sendEmail({ 
      email: ngo.email, 
      subject: 'HopeWorks - New Verification Code', 
      message: `Your new verification code is: ${otp}. It expires in 10 minutes.` 
    });

    res.status(200).json({ message: 'New verification code sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};