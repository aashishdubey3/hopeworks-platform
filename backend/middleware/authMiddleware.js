import jwt from 'jsonwebtoken';
import Ngo from '../models/Ngo.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if the authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token string (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the NGO and attach it to the request object (excluding the password)
      req.ngo = await Ngo.findById(decoded.id).select('-password');

      if (!req.ngo) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Move on to the actual controller
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const verifyAdmin = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Strictly check if the role is 'admin'
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Admin access only.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired admin token.' });
  }
};