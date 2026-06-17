import Donor from '../models/Donor.js';
import Campaign from '../models/Campaign.js';

export const exportForm10BD = async (req, res) => {
  try {
    // 1. Safely identify the logged-in user (handles different auth setups)
    const user = req.user || req.ngo;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // 2. Smart search: Check for both 'ngoId' and 'ngo' field names in your schema
    const campaigns = await Campaign.find({ 
      $or: [
        { ngo: user._id },
        { ngoId: user._id }
      ]
    });

    const campaignIds = campaigns.map(c => c._id);

    // 3. Find all donors for these campaigns
    const donors = await Donor.find({ campaignId: { $in: campaignIds } }).sort({ date: -1 });

    // 4. Create the CSV Header
    let csvData = 'Donor Name,Donor Email,Donation Amount (INR),PAN Number,Payment Date,Transaction ID\n';

    // 5. Loop through donors and format them into CSV rows
    donors.forEach(donor => {
      const name = `"${donor.name.replace(/"/g, '""')}"`; 
      const email = donor.email;
      const amount = donor.amount;
      const pan = donor.pan || 'Not Provided';
      const date = new Date(donor.date).toLocaleDateString('en-IN');
      const txId = donor.paymentId;

      csvData += `${name},${email},${amount},${pan},${date},${txId}\n`;
    });

    // 6. Send the file back
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Form10BD_Export_${Date.now()}.csv`);
    res.status(200).send(csvData);

  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ message: 'Failed to generate 10BD export.' });
  }
};