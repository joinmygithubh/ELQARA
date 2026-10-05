import express from 'express';
import { uploadSingle, uploadMultiple } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, adminOnly, upload.single('image'), uploadSingle);
router.post('/single', protect, adminOnly, upload.single('image'), uploadSingle);
router.post('/multiple', protect, adminOnly, upload.array('images', 8), uploadMultiple);

export default router;
