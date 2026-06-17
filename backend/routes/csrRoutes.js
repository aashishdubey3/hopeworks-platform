import express from 'express';
import { submitCsrInquiry } from '../controllers/csrController.js';

const router = express.Router();
router.post('/inquiry', submitCsrInquiry);
export default router;