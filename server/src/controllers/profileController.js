import { Attempt } from '../models/Attempt.js';
import { CourseProgress } from '../models/CourseProgress.js';

export async function getProfile(req, res) {
  const [testCount, progress] = await Promise.all([
    Attempt.countDocuments({ userId: req.user._id, kind: 'mock', status: 'completed' }),
    CourseProgress.find({ userId: req.user._id }).populate('courseId', 'title level')
  ]);
  res.json({
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      authProvider: req.user.authProvider,
      assignedLevel: req.user.assignedLevel,
      passedLevels: req.user.passedLevels,
      levelDeterminationCompletedAt: req.user.levelDeterminationCompletedAt
    },
    stats: { completedTests: testCount, coursesStarted: progress.length },
    courseProgress: progress
  });
}

