import { Attempt } from '../models/Attempt.js';
import { Course } from '../models/Course.js';
import { CourseProgress } from '../models/CourseProgress.js';
import { MockTest } from '../models/MockTest.js';

export async function getDashboard(req, res) {
  const [courses, progress, attempts, tests] = await Promise.all([
    Course.find({ level: { $in: ['N5', 'N4', 'N3'].slice(0, ['N5', 'N4', 'N3'].indexOf(req.user.assignedLevel) + 1) } }).sort({ featured: -1 }).limit(4),
    CourseProgress.find({ userId: req.user._id }),
    Attempt.find({ userId: req.user._id, kind: 'mock', status: 'completed' }).sort({ submittedAt: -1 }).limit(5),
    MockTest.find({}).sort({ createdAt: 1 }).limit(4)
  ]);
  const progressMap = new Map(progress.map((item) => [String(item.courseId), item]));
  const allMockAttempts = await Attempt.find({ userId: req.user._id, kind: 'mock', status: 'completed' });
  const averageScore = allMockAttempts.length ? Number((allMockAttempts.reduce((sum, item) => sum + item.percentage, 0) / allMockAttempts.length).toFixed(1)) : 0;
  const bestScore = allMockAttempts.reduce((best, item) => Math.max(best, item.percentage), 0);

  res.json({
    user: {
      fullName: req.user.fullName,
      assignedLevel: req.user.assignedLevel,
      passedLevels: req.user.passedLevels
    },
    stats: {
      completedTests: allMockAttempts.length,
      averageScore,
      bestScore,
      coursesStarted: progress.filter((item) => item.progressPercent > 0).length,
      studyTimeMinutes: 0,
      streak: 0
    },
    recommendedCourses: courses.map((course) => ({ ...course.toObject(), progressPercent: progressMap.get(String(course._id))?.progressPercent || 0 })),
    recommendedMockTests: tests.map((test) => ({ ...test.toObject(), numberOfQuestions: test.questionIds.length })),
    recentResults: attempts
  });
}

