import { Router } from 'express';
import { requireAuth, requireCompletedLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { answerQuestion, getAttempt, getResult, listResults, submitAttempt } from '../controllers/attemptController.js';

const router = Router();
router.use(requireAuth, requireCompletedLevel);
router.get('/', asyncHandler(listResults));
router.get('/:attemptId', asyncHandler(getAttempt));
router.post('/:attemptId/answers', asyncHandler(answerQuestion));
router.post('/:attemptId/submit', asyncHandler(submitAttempt));
router.get('/:attemptId/result', asyncHandler(getResult));

export default router;

