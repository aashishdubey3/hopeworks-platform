import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Ngo from '../models/Ngo.js';
import { sendEmail } from '../utils/emailService.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const registerNgo = async (req, res) => {
  try {
    const { name, email, password, cause, description, darpanId, address } = req.body;

    const ngoExists = await Ngo.findOne({ email: email.toLowerCase() });
    if (ngoExists) return res.status(400).json({ message: 'NGO already exists with this email.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    const ngo = await Ngo.create({
      name, email: email.toLowerCase(), password: hashedPassword,
      cause, description, darpanId, address,
      status: 'pending', isEmailVerified: false,
      verificationOTP: otp, otpExpires: otpExpires
    });

    const emailMessage = `Welcome to HopeWorks! Your email verification code is: ${otp}. This code expires in 10 minutes.`;
    
    // THE FIX: Fire and forget! Send email in background.
    sendEmail({ email: ngo.email, subject: 'HopeWorks - Verify Your Email', message: emailMessage }).catch(console.error);

    res.status(201).json({ message: 'Registration initiated. Please check your email for the 6-digit verification code.', email: ngo.email });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });
    if (!ngo) return res.status(400).json({ message: 'User not found.' });

    if (ngo.verificationOTP !== otp || ngo.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    ngo.isEmailVerified = true;
    ngo.verificationOTP = undefined;
    ngo.otpExpires = undefined;
    await ngo.save();

    res.status(200).json({ message: 'Email verified successfully! Please wait for Admin approval to log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification.' });
  }
};

export const loginNgo = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });

    if (!ngo) return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, ngo.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    if (!ngo.isEmailVerified) return res.status(403).json({ message: 'Please verify your email address before logging in.' });
    if (ngo.status === 'pending') return res.status(403).json({ message: 'Security Alert: Your account is awaiting Admin Verification.' });
    if (ngo.status === 'rejected') return res.status(403).json({ message: 'Your application to join HopeWorks was declined.' });
    if (ngo.status === 'deactivated' || ngo.isBanned) return res.status(403).json({ message: 'This account has been suspended or deactivated.' });

    res.status(200).json({
      _id: ngo._id, name: ngo.name, email: ngo.email, avatar: ngo.avatar, 
      token: generateToken(ngo._id), status: ngo.status, isBanned: ngo.isBanned
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });

    if (!ngo) return res.status(404).json({ message: 'No account found with that email.' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    ngo.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    ngo.resetPasswordExpires = Date.now() + 15 * 60 * 1000; 
    await ngo.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please click this link to set a new password: \n\n ${resetUrl} \n\n This link expires in 15 minutes.`;

    // THE FIX: Fire and forget! Instant response for the user.
    sendEmail({ email: ngo.email, subject: 'HopeWorks - Password Reset', message }).catch(console.error);

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset email.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const ngo = await Ngo.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } });

    if (!ngo) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    const salt = await bcrypt.genSalt(10);
    ngo.password = await bcrypt.hash(req.body.password, salt);
    
    ngo.resetPasswordToken = undefined;
    ngo.resetPasswordExpires = undefined;
    await ngo.save();

    res.status(200).json({ message: 'Password successfully reset! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password.' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const ngo = await Ngo.findOne({ email: email.toLowerCase() });
    if (!ngo) return res.status(404).json({ message: 'User not found.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    ngo.verificationOTP = otp;
    ngo.otpExpires = Date.now() + 10 * 60 * 1000;
    await ngo.save();

    // THE FIX: Fire and forget!
    sendEmail({ 
      email: ngo.email, 
      subject: 'HopeWorks - New Verification Code', 
      message: `Your new verification code is: ${otp}. It expires in 10 minutes.` 
    }).catch(console.error);

    res.status(200).json({ message: 'New verification code sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};