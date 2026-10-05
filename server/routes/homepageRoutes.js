import express from 'express';
import { getHomepageSettings, updateHomepageSettings } from '../controllers/homepageController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHomepageSettings);
router.put('/', protect, adminOnly, updateHomepageSettings);

export default router;
