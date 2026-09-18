import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  kind: { type: String, enum: ['assessment', 'mock'], required: true },
  examType: { type: String, enum: ['LEVEL_DETERMINATION', 'JLPT', 'NAT', 'JFT'], required: true },
  level: { type: String, required: true },
  section: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [{ text: { type: String, required: true } }],
  correctOption: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' }
}, { timestamps: true });

export const Question = mongoose.model('Question', questionSchema);

