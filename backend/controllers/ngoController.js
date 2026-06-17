import Ngo from '../models/Ngo.js';
import News from '../models/News.js';
import Event from '../models/Event.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new NGO
// @route   POST /api/ngos/register
export const registerNgo = async (req, res) => {
  try {
    const { name, email, password, address, about, panNumber, darpanId } = req.body;

    // 1. Check if NGO already exists
    const ngoExists = await Ngo.findOne({ email });
    if (ngoExists) {
      return res.status(400).json({ message: 'An NGO with this email already exists' });
    }

    // 2. Hash the password for database security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the NGO
    const ngo = await Ngo.create({
      name,
      email,
      password: hashedPassword,
      address,
      about,
      panNumber,
      darpanId,
      status: 'approved', 
      isBanned: false
    });

    if (ngo) {
      res.status(201).json({
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        token: generateToken(ngo._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid NGO data received' });
    }
  } catch (error) {
    console.error("NGO Registration Error:", error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Authenticate/Login NGO
// @route   POST /api/ngos/login
export const loginNgo = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the NGO by email
    const ngo = await Ngo.findOne({ email });

    if (!ngo) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 2. Check if the Admin dropped the ban hammer
    if (ngo.isBanned) {
      return res.status(403).json({ message: 'This account has been suspended by the platform administrators.' });
    }

    // 3. Compare the typed password with the hashed database password
    const isMatch = await bcrypt.compare(password, ngo.password);

    if (isMatch) {
      res.json({
        id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        token: generateToken(ngo._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("NGO Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get all NGOs (Merged: Search Engine + Approved Status + ID Mapping)
// @route   GET /api/ngos
export const getNgos = async (req, res) => {
  try {
    const keyword = req.query.search 
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { about: { $regex: req.query.search, $options: 'i' } },
            { address: { $regex: req.query.search, $options: 'i' } },
            // THE FIX: Added 'cause' to the database search parameters!
            { cause: { $regex: req.query.search, $options: 'i' } } 
          ]
        } 
      : {};

    const ngos = await Ngo.find({ ...keyword, status: 'approved', isBanned: { $ne: true } })
      .select('-password -__v')
      .sort({ createdAt: -1 });
    
    const formattedNgos = ngos.map(ngo => ({
      ...ngo.toObject(),
      id: ngo._id
    }));

    res.status(200).json(formattedNgos);
  } catch (error) {
    console.error("NGO Search Error:", error);
    res.status(500).json({ message: "Failed to fetch NGOs" });
  }
};

// @desc    Get single NGO by ID
// @route   GET /api/ngos/:id
export const getNgoById = async (req, res) => {
  try {
    const ngo = await Ngo.findById(req.params.id).select('-password -__v');
    
    if (ngo) {
      const formattedNgo = { ...ngo.toObject(), id: ngo._id };
      res.json(formattedNgo);
    } else {
      res.status(404).json({ message: 'NGO not found' });
    }
  } catch (error) {
    console.error("Fetch Single NGO Error:", error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'NGO not found' });
    }
    res.status(500).json({ message: 'Server error fetching NGO.' });
  }
};

// @desc    Get all news for a specific NGO
// @route   GET /api/ngos/:id/news
export const getNgoNews = async (req, res) => {
  try {
    const news = await News.find({ ngoId: req.params.id }).sort({ date: -1 });
    res.json(news);
  } catch (error) {
    console.error("Fetch NGO News Error:", error);
    res.status(500).json({ message: "Server error fetching news" });
  }
};

// @desc    Get all events for a specific NGO
// @route   GET /api/ngos/:id/events
export const getNgoEvents = async (req, res) => {
  try {
    const events = await Event.find({ ngoId: req.params.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error("Fetch NGO Events Error:", error);
    res.status(500).json({ message: "Server error fetching events" });
  }
};

// @desc    Update NGO Profile & Avatar (Protected)
// @route   PUT /api/ngos/profile
export const updateNgoProfile = async (req, res) => {
  try {
    const user = req.user || req.ngo;
    const ngo = await Ngo.findById(user._id); 

    if (!ngo) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // 1. Update text fields if they were provided in the FormData
    if (req.body.name) ngo.name = req.body.name;
    if (req.body.email) ngo.email = req.body.email;
    if (req.body.about) ngo.about = req.body.about;
    if (req.body.description) ngo.description = req.body.description;
    if (req.body.address) ngo.address = req.body.address;
    if (req.body.cause) ngo.cause = req.body.cause;
    if (req.body.darpanId) ngo.darpanId = req.body.darpanId;
    if (req.body.panNumber) ngo.panNumber = req.body.panNumber;
      
    // 2. THE MAGIC: Save the Cloudinary URL if Multer intercepted a file!
    if (req.file) {
      ngo.avatar = req.file.path; 
    }

    // 3. Save the updated organization to the database
    const updatedNgo = await ngo.save();

    res.json({
      id: updatedNgo._id,
      name: updatedNgo.name,
      email: updatedNgo.email,
      avatar: updatedNgo.avatar, // Pass the new avatar back to the frontend
      message: "Profile updated successfully!"
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};