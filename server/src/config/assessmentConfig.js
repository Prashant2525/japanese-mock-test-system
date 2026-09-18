export const LEVELS = ['N5', 'N4', 'N3'];

export const ASSESSMENT_CONFIG = {
  passingThreshold: 90,
  scoring: {
    pointsPerQuestion: 1,
    percentage(correctAnswers, totalQuestions) {
      if (!totalQuestions) return 0;
      return Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    }
  },
  levels: LEVELS,
  estimatedDurationMinutes: 20
};

export const MOCK_TEST_CONFIG = {
  passingThreshold: 90,
  pointsPerQuestion: 1
};

export function getNextLevel(level) {
  const index = LEVELS.indexOf(level);
  return index >= 0 ? LEVELS[index + 1] || null : null;
}

