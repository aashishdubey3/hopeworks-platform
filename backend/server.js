import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import campaignRoutes from './routes/campaignRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

// Route Imports
import ngoRoutes from './routes/ngoRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import csrRoutes from './routes/csrRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import path from 'path';
import contactRoutes from './routes/contactRoutes.js';


// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Replaces bodyParser.json()

// Mount Routes
app.use('/api/ngos', ngoRoutes);

app.use('/api/campaigns', campaignRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/csr', csrRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);



// Expose the uploads folder to the frontend
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Health Check Route
app.get('/', (req, res) => {
  res.send('HopeWorks API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});