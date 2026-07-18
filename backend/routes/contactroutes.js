import express from 'express';
import { submitFeedback } from '../controllers/contactController.js';

const router = express.Router();

// Public route: Anyone can submit feedback
router.post('/', submitFeedback);

export default router;