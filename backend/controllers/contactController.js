import ContactMessage from '../models/ContactMessage.js';
import { sendEmail } from '../utils/emailService.js';

export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Save the message to the MongoDB database (so it appears on the Admin Dashboard)
    const newFeedback = await ContactMessage.create({
      name,
      email,
      message
    });

    // 2. Forward the feedback directly to your official support email!
    const emailBody = `You have received new platform feedback from ${name} (${email}):\n\n${message}`;
    
    // Fire and forget email dispatch
    sendEmail({ 
      email: 'support.hopeworks@gmail.com', 
      subject: 'New HopeWorks Platform Feedback', 
      message: emailBody 
    }).catch(console.error);

    // 3. Tell the frontend it was a success
    res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (error) {
    console.error("Feedback submission error:", error);
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
};