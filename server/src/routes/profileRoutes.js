import { Router } from 'express';
import { requireAuth, requireCompletedLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getProfile } from '../controllers/profileController.js';

const router = Router();
router.get('/', requireAuth, requireCompletedLevel, asyncHandler(getProfile));

export default router;

