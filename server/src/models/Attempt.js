import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number, default: null }
}, { _id: false });

const sectionResultSchema = new mongoose.Schema({
  section: String,
  totalQuestions: Number,
  correctAnswers: Number,
  marksObtained: Number,
  percentage: Number
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kind: { type: String, enum: ['assessment', 'mock'], required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', default: null },
  level: { type: String, required: true },
  examType: { type: String, required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  answers: { type: [answerSchema], default: [] },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  durationSeconds: { type: Number, default: null },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date, default: null },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  marksObtained: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passingThreshold: { type: Number, default: 90 },
  passed: { type: Boolean, default: false },
  sectionResults: { type: [sectionResultSchema], default: [] },
  review: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { timestamps: true });

export const Attempt = mongoose.model('Attempt', attemptSchema);

