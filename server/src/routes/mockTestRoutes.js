import { Router } from 'express';
import { requireAuth, requireCompletedLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getMockTest, listMockTests, startMockTest } from '../controllers/mockTestController.js';

const router = Router();
router.use(requireAuth, requireCompletedLevel);
router.get('/', asyncHandler(listMockTests));
router.get('/:testId', asyncHandler(getMockTest));
router.post('/:testId/start', asyncHandler(startMockTest));

export default router;

