import { Attempt } from '../models/Attempt.js';
import { MockTest } from '../models/MockTest.js';
import { Question } from '../models/Question.js';

function attemptSummary(attempt) {
  if (!attempt) return null;
  return {
    id: attempt._id,
    percentage: attempt.percentage,
    passed: attempt.passed,
    submittedAt: attempt.submittedAt,
    score: `${attempt.marksObtained}/${attempt.totalMarks}`
  };
}

export async function listMockTests(req, res) {
  const query = {};
  if (req.query.examType) query.examType = req.query.examType;
  if (req.query.level) query.level = req.query.level;
  if (req.query.difficulty) query.difficulty = req.query.difficulty;
  if (req.query.section) query.sections = req.query.section;

  const tests = await MockTest.find(query).sort({ examType: 1, level: 1, createdAt: 1 });
  const attempts = await Attempt.find({ userId: req.user._id, kind: 'mock', testId: { $in: tests.map((test) => test._id) }, status: 'completed' }).sort({ submittedAt: -1 });
  const attemptsByTest = new Map();
  for (const attempt of attempts) {
    const key = String(attempt.testId);
    if (!attemptsByTest.has(key)) attemptsByTest.set(key, []);
    attemptsByTest.get(key).push(attempt);
  }

  const data = tests.map((test) => {
    const history = attemptsByTest.get(String(test._id)) || [];
    const best = history.reduce((current, item) => (!current || item.percentage > current.percentage ? item : current), null);
    const statusFilter = req.query.status;
    const status = history.length ? 'Completed' : 'Not started';
    return { ...test.toObject(), numberOfQuestions: test.questionIds.length, status, previousAttempt: attemptSummary(history[0]), bestAttempt: attemptSummary(best), _statusFilter: statusFilter };
  }).filter((test) => !req.query.status || test._statusFilter === req.query.status || (req.query.status === 'completed' && test.status === 'Completed') || (req.query.status === 'not_started' && test.status === 'Not started'));
  res.json({ mockTests: data });
}

export async function getMockTest(req, res) {
  const test = await MockTest.findById(req.params.testId);
  if (!test) return res.status(404).json({ message: 'Mock test not found.' });
  const attempts = await Attempt.find({ userId: req.user._id, kind: 'mock', testId: test._id, status: 'completed' }).sort({ submittedAt: -1 });
  res.json({
    mockTest: { ...test.toObject(), numberOfQuestions: test.questionIds.length },
    previousAttempts: attempts.map(attemptSummary)
  });
}

export async function startMockTest(req, res) {
  const test = await MockTest.findById(req.params.testId);
  if (!test) return res.status(404).json({ message: 'Mock test not found.' });

  const existing = await Attempt.findOne({ userId: req.user._id, kind: 'mock', testId: test._id, status: 'in_progress' });
  if (existing) return res.json({ attemptId: existing._id });

  const questions = await Question.find({ _id: { $in: test.questionIds } });
  const attempt = await Attempt.create({
    userId: req.user._id,
    kind: 'mock',
    testId: test._id,
    level: test.level,
    examType: test.examType,
    questionIds: test.questionIds,
    totalQuestions: questions.length,
    durationSeconds: test.durationMinutes * 60
  });
  res.status(201).json({ attemptId: attempt._id });
}

