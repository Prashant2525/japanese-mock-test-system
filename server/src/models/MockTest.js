import mongoose from 'mongoose';

const mockTestSchema = new mongoose.Schema({
  examType: { type: String, enum: ['JLPT', 'NAT', 'JFT'], required: true },
  level: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  sections: [{ type: String, required: true }],
  durationMinutes: { type: Number, required: true },
  difficulty: { type: String, enum: ['Foundational', 'Intermediate', 'Advanced'], required: true }
}, { timestamps: true });

export const MockTest = mongoose.model('MockTest', mockTestSchema);

