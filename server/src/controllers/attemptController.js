import { Attempt } from '../models/Attempt.js';
import { Question } from '../models/Question.js';
import { MockTest } from '../models/MockTest.js';
import { calculateScore } from '../services/scoringService.js';

async function getQuestions(attempt) {
  const questions = await Question.find({ _id: { $in: attempt.questionIds } });
  const byId = new Map(questions.map((question) => [String(question._id), question]));
  return attempt.questionIds.map((id) => byId.get(String(id))).filter(Boolean);
}

function questionForClient(question) {
  return {
    id: question._id,
    section: question.section,
    prompt: question.prompt,
    options: question.options.map((option) => ({ text: option.text })),
    imageUrl: question.imageUrl || '',
    audioUrl: question.audioUrl || ''
  };
}

function attemptForClient(attempt, questions) {
  return {
    id: attempt._id,
    testId: attempt.testId,
    examType: attempt.examType,
    level: attempt.level,
    durationSeconds: attempt.durationSeconds,
    startedAt: attempt.startedAt,
    status: attempt.status,
    questions: questions.map(questionForClient),
    answers: attempt.answers
  };
}

export async function getAttempt(req, res) {
  const attempt = await Attempt.findOne({ _id: req.params.attemptId, userId: req.user._id, kind: 'mock' });
  if (!attempt) return res.status(404).json({ message: 'Test attempt not found.' });
  const questions = await getQuestions(attempt);
  res.json({ attempt: attemptForClient(attempt, questions), test: attempt.testId ? await MockTest.findById(attempt.testId).select('title sections durationMinutes') : null });
}

export async function answerQuestion(req, res) {
  const { questionId, selectedOption } = req.body;
  const attempt = await Attempt.findOne({ _id: req.params.attemptId, userId: req.user._id, kind: 'mock', status: 'in_progress' });
  if (!attempt) return res.status(404).json({ message: 'Active test attempt not found.' });
  if (!attempt.questionIds.some((id) => String(id) === String(questionId))) return res.status(400).json({ message: 'Question does not belong to this test.' });

  const existing = attempt.answers.find((answer) => String(answer.questionId) === String(questionId));
  if (existing) existing.selectedOption = selectedOption === null ? null : Number(selectedOption);
  else attempt.answers.push({ questionId, selectedOption: selectedOption === null ? null : Number(selectedOption) });
  await attempt.save();
  res.json({ answers: attempt.answers });
}

export async function submitAttempt(req, res) {
  const attempt = await Attempt.findOne({ _id: req.params.attemptId, userId: req.user._id, kind: 'mock', status: 'in_progress' });
  if (!attempt) {
    const completed = await Attempt.findOne({ _id: req.params.attemptId, userId: req.user._id, kind: 'mock', status: 'completed' });
    if (completed) return res.json({ attemptId: completed._id, result: completed });
    return res.status(404).json({ message: 'Active test attempt not found.' });
  }

  const questions = await getQuestions(attempt);
  const autoSubmitted = Date.now() >= attempt.startedAt.getTime() + attempt.durationSeconds * 1000;
  const score = calculateScore(questions, attempt.answers, 'mock');
  attempt.status = 'completed';
  attempt.submittedAt = new Date();
  Object.assign(attempt, score);
  await attempt.save();
  res.json({ attemptId: attempt._id, autoSubmitted, result: attempt });
}

export async function getResult(req, res) {
  const attempt = await Attempt.findOne({ _id: req.params.attemptId, userId: req.user._id, status: 'completed' });
  if (!attempt) return res.status(404).json({ message: 'Result not found.' });
  const test = attempt.testId ? await MockTest.findById(attempt.testId).select('title examType level sections durationMinutes difficulty') : null;
  res.json({ result: attempt, test });
}

export async function listResults(req, res) {
  const attempts = await Attempt.find({ userId: req.user._id, status: 'completed' }).sort({ submittedAt: -1 });
  const testIds = attempts.filter((attempt) => attempt.testId).map((attempt) => attempt.testId);
  const tests = await MockTest.find({ _id: { $in: testIds } }).select('title examType level');
  const testMap = new Map(tests.map((test) => [String(test._id), test]));
  res.json({ results: attempts.map((attempt) => ({
    id: attempt._id,
    kind: attempt.kind,
    title: attempt.testId ? testMap.get(String(attempt.testId))?.title : 'Level Determination Assessment',
    examType: attempt.examType,
    level: attempt.level,
    totalQuestions: attempt.totalQuestions,
    marksObtained: attempt.marksObtained,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    passed: attempt.passed,
    submittedAt: attempt.submittedAt
  })) });
}

