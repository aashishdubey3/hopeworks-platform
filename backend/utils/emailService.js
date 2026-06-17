import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// THE FIX: Instant, cached transporter. No manual Google API token fetching!
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
};

export const sendReceiptEmail = async (donorEmail, donorName, ngoName, amount, receiptUrl) => {
  try {
    const emailTransporter = createTransporter();
    
    const mailOptions = {
      from: `HopeWorks Platform <${process.env.GMAIL_USER}>`,
      to: donorEmail,
      subject: `Your 80G Tax Receipt - Thank you from ${ngoName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1C2331; max-width: 600px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #007A78;">Thank you for your generous donation, ${donorName}!</h2>
          <p>Your contribution of <strong>₹${amount.toLocaleString('en-IN')}</strong> to <strong>${ngoName}</strong> has been successfully processed.</p>
          <p>Your transparent donation helps drive real impact. As requested, your official 80G Tax Exemption receipt is ready.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${receiptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1C2331; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Download 80G Receipt (PDF)
            </a>
          </div>
          
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            If the button doesn't work, copy and paste this link: <br/>
            <a href="${receiptUrl}" style="color: #007A78;">${receiptUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 14px;">With gratitude,<br/><strong>The HopeWorks Team</strong></p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Automated receipt sent to: ${donorEmail}`);
  } catch (error) {
    console.error("❌ Gmail API Error:", error);
  }
};

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const emailTransporter = createTransporter();
    const formattedMessage = message.replace(/\n/g, '<br/>');

    const mailOptions = {
      from: `HopeWorks Security <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 30px; color: #0B2948; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #007A78; font-weight: 900; margin-bottom: 20px; font-size: 24px;">HopeWorks Security</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #475569;">${formattedMessage}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This is an automated security message. Please do not reply.</p>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Security email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Generic Email API Error:", error);
  }
};