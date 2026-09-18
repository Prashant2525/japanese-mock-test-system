import { Router } from 'express';
import { requireAuth, requireCompletedLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getCourse, listCourses, updateCourseProgress } from '../controllers/courseController.js';

const router = Router();
router.use(requireAuth, requireCompletedLevel);
router.get('/', asyncHandler(listCourses));
router.get('/:courseId', asyncHandler(getCourse));
router.post('/:courseId/progress', asyncHandler(updateCourseProgress));

export default router;

