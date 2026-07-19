import express from 'express';
import { submitFeedback } from '../controllers/TEMP_controller.js';

const router = express.Router();

// Public route: Anyone can submit feedback
router.post('/', submitFeedback);

export default router;
// Force Render Update 2