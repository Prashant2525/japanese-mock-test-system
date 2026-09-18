import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { answerAssessmentQuestion, getAssessmentStatus, startAssessment, submitAssessmentLevel } from '../controllers/assessmentController.js';

const router = Router();
router.use(requireAuth);
router.get('/status', asyncHandler(getAssessmentStatus));
router.post('/start', asyncHandler(startAssessment));
router.post('/:attemptId/answers', asyncHandler(answerAssessmentQuestion));
router.post('/:attemptId/submit', asyncHandler(submitAssessmentLevel));

export default router;

