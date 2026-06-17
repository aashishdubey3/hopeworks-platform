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