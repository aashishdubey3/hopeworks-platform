import express from 'express';
import { 
  getNgos, 
  getNgoById, 
  getNgoNews,   
  getNgoEvents,
  registerNgo,  
  loginNgo,
  updateNgoProfile 
} from '../controllers/ngoController.js';
import { exportForm10BD } from '../controllers/exportController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../Middleware/uploadMiddleware.js'; // <-- NEW: Imported Multer!

const router = express.Router();

// AUTHENTICATION ROUTES
router.post('/register', registerNgo);
router.post('/login', loginNgo);

// STATIC/PROTECTED ROUTES
router.get('/export-10bd', protect, exportForm10BD);

// <-- NEW: upload.single('avatar') catches the file from the frontend FormData
router.put('/profile', protect, upload.single('avatar'), updateNgoProfile); 

// PUBLIC LIST ROUTE
router.get('/', getNgos);

// NGO SUB-COLLECTION ROUTES 
router.get('/:id/news', getNgoNews);     
router.get('/:id/events', getNgoEvents); 

// DYNAMIC ROUTES 
router.get('/:id', getNgoById); 

export default router;