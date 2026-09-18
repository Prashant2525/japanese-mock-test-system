import { Attempt } from '../models/Attempt.js';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
import { ASSESSMENT_CONFIG, getNextLevel } from '../config/assessmentConfig.js';
import { calculateScore } from '../services/scoringService.js';

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

async function getQuestionsForAttempt(attempt) {
  const questions = await Question.find({ _id: { $in: attempt.questionIds } });
  const byId = new Map(questions.map((question) => [String(question._id), question]));
  return attempt.questionIds.map((id) => byId.get(String(id))).filter(Boolean);
}

function attemptForClient(attempt, questions) {
  return {
    id: attempt._id,
    level: attempt.level,
    examType: attempt.examType,
    questions: questions.map(questionForClient),
    answers: attempt.answers.map((answer) => ({ questionId: answer.questionId, selectedOption: answer.selectedOption })),
    startedAt: attempt.startedAt,
    durationSeconds: attempt.durationSeconds,
    status: attempt.status
  };
}

export async function getAssessmentStatus(req, res) {
  const user = req.user;
  const questionCount = await Question.countDocuments({ kind: 'assessment', level: user.assessmentCurrentLevel });
  const inProgress = await Attempt.findOne({ userId: user._id, kind: 'assessment', status: 'in_progress' }).sort({ createdAt: -1 });
  const latestCompleted = await Attempt.findOne({ userId: user._id, kind: 'assessment', status: 'completed' }).sort({ submittedAt: -1 });
  const questions = inProgress ? await getQuestionsForAttempt(inProgress) : [];

  res.json({
    completed: user.levelDeterminationStatus === 'completed',
    status: user.levelDeterminationStatus,
    currentLevel: user.assessmentCurrentLevel,
    questionCount,
    assignedLevel: user.assignedLevel,
    passedLevels: user.passedLevels,
    latestResult: latestCompleted ? {
      id: latestCompleted._id,
      level: latestCompleted.level,
      percentage: latestCompleted.percentage,
      passed: latestCompleted.passed,
      correctAnswers: latestCompleted.correctAnswers,
      totalQuestions: latestCompleted.totalQuestions,
      sectionResults: latestCompleted.sectionResults
    } : null,
    attempt: inProgress ? attemptForClient(inProgress, questions) : null
  });
}

export async function startAssessment(req, res) {
  const user = await User.findById(req.user._id);
  if (user.levelDeterminationStatus === 'completed') {
    return res.status(409).json({ message: 'Level determination has already been completed.', assignedLevel: user.assignedLevel });
  }

  let attempt = await Attempt.findOne({ userId: user._id, kind: 'assessment', status: 'in_progress' });
  if (!attempt) {
    const questions = await Question.find({ kind: 'assessment', level: user.assessmentCurrentLevel }).sort({ createdAt: 1 });
    if (!questions.length) return res.status(404).json({ message: `No assessment content is available for ${user.assessmentCurrentLevel}.` });
    attempt = await Attempt.create({
      userId: user._id,
      kind: 'assessment',
      examType: 'LEVEL_DETERMINATION',
      level: user.assessmentCurrentLevel,
      questionIds: questions.map((question) => question._id),
      totalQuestions: questions.length,
      answers: [],
      durationSeconds: null
    });
    user.levelDeterminationStatus = 'in_progress';
    await user.save();
  }

  const questions = await getQuestionsForAttempt(attempt);
  res.json({ attempt: attemptForClient(attempt, questions), currentLevel: user.assessmentCurrentLevel });
}

export async function answerAssessmentQuestion(req, res) {
  const { attemptId } = req.params;
  const { questionId, selectedOption } = req.body;
  const attempt = await Attempt.findOne({ _id: attemptId, userId: req.user._id, kind: 'assessment', status: 'in_progress' });
  if (!attempt) return res.status(404).json({ message: 'Assessment attempt not found.' });
  if (!attempt.questionIds.some((id) => String(id) === String(questionId))) return res.status(400).json({ message: 'Question does not belong to this assessment.' });

  const existing = attempt.answers.find((answer) => String(answer.questionId) === String(questionId));
  if (existing) existing.selectedOption = selectedOption === null ? null : Number(selectedOption);
  else attempt.answers.push({ questionId, selectedOption: selectedOption === null ? null : Number(selectedOption) });
  await attempt.save();
  res.json({ answers: attempt.answers });
}

export async function submitAssessmentLevel(req, res) {
  const { attemptId } = req.params;
  const attempt = await Attempt.findOne({ _id: attemptId, userId: req.user._id, kind: 'assessment', status: 'in_progress' });
  if (!attempt) return res.status(404).json({ message: 'Assessment attempt not found.' });

  const questions = await getQuestionsForAttempt(attempt);
  const score = calculateScore(questions, attempt.answers, 'assessment');
  attempt.status = 'completed';
  attempt.submittedAt = new Date();
  Object.assign(attempt, score);
  await attempt.save();

  const user = await User.findById(req.user._id);
  const passedLevels = [...new Set([...user.passedLevels, attempt.level])];
  user.passedLevels = passedLevels;

  const nextLevel = getNextLevel(attempt.level);
  if (score.passed && nextLevel) {
    user.assessmentCurrentLevel = nextLevel;
    user.levelDeterminationStatus = 'in_progress';
    await user.save();
    return res.json({
      phase: 'passed',
      level: attempt.level,
      nextLevel,
      passedLevels,
      score: score.percentage,
      passingThreshold: score.passingThreshold,
      assignedLevel: null
    });
  }

  const assignedLevel = score.passed ? attempt.level : passedLevels[passedLevels.length - 1] || 'N5';
  user.assignedLevel = assignedLevel;
  user.assessmentCurrentLevel = assignedLevel;
  user.levelDeterminationStatus = 'completed';
  user.levelDeterminationCompletedAt = new Date();
  await user.save();

  return res.json({
    phase: score.passed ? 'final' : 'failed',
    level: attempt.level,
    passedLevels,
    score: score.percentage,
    passingThreshold: score.passingThreshold,
    assignedLevel,
    totalQuestions: score.totalQuestions,
    correctAnswers: score.correctAnswers,
    sectionResults: score.sectionResults,
    recommendation: score.passed
      ? `You are ready to continue with ${assignedLevel} learning materials.`
      : `Build confidence with ${assignedLevel} materials before moving forward.`
  });
}
