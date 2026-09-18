import { ASSESSMENT_CONFIG, MOCK_TEST_CONFIG } from '../config/assessmentConfig.js';

export function calculateScore(questions, answers, mode = 'mock') {
  const config = mode === 'assessment' ? ASSESSMENT_CONFIG.scoring : MOCK_TEST_CONFIG;
  const answerMap = new Map((answers || []).map((answer) => [String(answer.questionId), answer.selectedOption]));
  const sectionMap = new Map();
  let correctAnswers = 0;

  const review = questions.map((question) => {
    const selectedOption = answerMap.has(String(question._id)) ? answerMap.get(String(question._id)) : null;
    const isCorrect = selectedOption !== null && Number(selectedOption) === Number(question.correctOption);
    if (isCorrect) correctAnswers += 1;

    const section = question.section || 'General';
    if (!sectionMap.has(section)) sectionMap.set(section, { section, totalQuestions: 0, correctAnswers: 0 });
    const sectionResult = sectionMap.get(section);
    sectionResult.totalQuestions += 1;
    if (isCorrect) sectionResult.correctAnswers += 1;

    return {
      questionId: question._id,
      question: question.prompt,
      imageUrl: question.imageUrl || null,
      audioUrl: question.audioUrl || null,
      options: question.options,
      selectedOption,
      correctOption: question.correctOption,
      isCorrect,
      explanation: question.explanation || ''
    };
  });

  const totalQuestions = questions.length;
  const totalMarks = totalQuestions * config.pointsPerQuestion;
  const marksObtained = correctAnswers * config.pointsPerQuestion;
  const percentage = mode === 'assessment'
    ? ASSESSMENT_CONFIG.scoring.percentage(correctAnswers, totalQuestions)
    : Number(((marksObtained / totalMarks) * 100 || 0).toFixed(2));
  const passingThreshold = mode === 'assessment' ? ASSESSMENT_CONFIG.passingThreshold : MOCK_TEST_CONFIG.passingThreshold;

  const sectionResults = [...sectionMap.values()].map((section) => ({
    ...section,
    marksObtained: section.correctAnswers * config.pointsPerQuestion,
    percentage: Number(((section.correctAnswers / section.totalQuestions) * 100 || 0).toFixed(2))
  }));

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    totalMarks,
    marksObtained,
    percentage,
    passingThreshold,
    passed: percentage >= passingThreshold,
    sectionResults,
    review
  };
}

