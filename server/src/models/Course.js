import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['reading', 'listening', 'practice'], required: true },
  durationMinutes: { type: Number, required: true },
  content: { type: String, required: true },
  explanation: { type: String, default: '' },
  transcript: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  documentUrl: { type: String, default: '' }
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { type: String, enum: ['N5', 'N4', 'N3'], required: true },
  category: { type: String, enum: ['Listening', 'Grammar', 'Reading', 'Kanji', 'Vocabulary'], required: true },
  description: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  lessons: { type: [lessonSchema], default: [] },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);
