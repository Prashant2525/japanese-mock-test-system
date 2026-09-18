import { Course } from '../models/Course.js';
import { CourseProgress } from '../models/CourseProgress.js';

function allowedLevels(assignedLevel) {
  const levels = ['N5', 'N4', 'N3'];
  const index = levels.indexOf(assignedLevel);
  return index >= 0 ? levels.slice(0, index + 1) : ['N5'];
}

function courseWithProgress(course, progress) {
  return {
    ...course.toObject(),
    lessons: course.lessons.map((lesson) => ({
      ...lesson.toObject(),
      content: lesson.content,
      explanation: lesson.explanation,
      transcript: lesson.transcript,
      audioUrl: lesson.audioUrl,
      imageUrl: lesson.imageUrl,
      documentUrl: lesson.documentUrl
    })),
    progressPercent: progress?.progressPercent || 0,
    completedLessonIds: progress?.completedLessonIds || [],
    status: progress?.progressPercent >= 100 ? 'Completed' : progress?.progressPercent > 0 ? 'In progress' : 'Not started'
  };
}

export async function listCourses(req, res) {
  const levels = allowedLevels(req.user.assignedLevel);
  const query = { level: { $in: levels } };
  if (req.query.level && levels.includes(req.query.level)) query.level = req.query.level;
  if (req.query.category) query.category = req.query.category;
  if (req.query.search) query.$or = [
    { title: { $regex: req.query.search, $options: 'i' } },
    { description: { $regex: req.query.search, $options: 'i' } }
  ];

  const courses = await Course.find(query).sort({ featured: -1, level: 1, createdAt: 1 });
  const progress = await CourseProgress.find({ userId: req.user._id, courseId: { $in: courses.map((course) => course._id) } });
  const progressMap = new Map(progress.map((item) => [String(item.courseId), item]));
  res.json({ courses: courses.map((course) => courseWithProgress(course, progressMap.get(String(course._id)))), levels, assignedLevel: req.user.assignedLevel });
}

export async function getCourse(req, res) {
  const levels = allowedLevels(req.user.assignedLevel);
  const course = await Course.findOne({ _id: req.params.courseId, level: { $in: levels } });
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  const progress = await CourseProgress.findOne({ userId: req.user._id, courseId: course._id });
  res.json({ course: courseWithProgress(course, progress) });
}

export async function updateCourseProgress(req, res) {
  const { lessonId, completed = true } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found.' });
  const lessonExists = course.lessons.some((lesson) => String(lesson._id) === String(lessonId));
  if (!lessonExists) return res.status(400).json({ message: 'Lesson does not belong to this course.' });

  const progress = await CourseProgress.findOneAndUpdate(
    { userId: req.user._id, courseId: course._id },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const completedIds = new Set(progress.completedLessonIds.map(String));
  if (completed) completedIds.add(String(lessonId));
  else completedIds.delete(String(lessonId));
  progress.completedLessonIds = [...completedIds];
  progress.progressPercent = Math.round((completedIds.size / course.lessons.length) * 100);
  await progress.save();
  res.json({ progressPercent: progress.progressPercent, completedLessonIds: progress.completedLessonIds });
}

export { allowedLevels };
