import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['local', 'google', 'both'], default: 'local' },
  levelDeterminationStatus: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  assessmentCurrentLevel: { type: String, enum: ['N5', 'N4', 'N3'], default: 'N5' },
  assignedLevel: { type: String, enum: ['N5', 'N4', 'N3'], default: null },
  passedLevels: { type: [String], default: [] },
  levelDeterminationCompletedAt: { type: Date, default: null },
  passwordResetTokenHash: { type: String, select: false, default: null },
  passwordResetExpiresAt: { type: Date, select: false, default: null }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);

