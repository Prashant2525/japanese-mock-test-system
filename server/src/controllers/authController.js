import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { clearAuthCookie, createOpaqueToken, setAuthCookie } from '../services/tokenService.js';
import { isMailConfigured, sendPasswordResetEmail } from '../services/mailService.js';

function publicUser(user) {
  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    authProvider: user.authProvider,
    levelDeterminationStatus: user.levelDeterminationStatus,
    assessmentCurrentLevel: user.assessmentCurrentLevel,
    assignedLevel: user.assignedLevel,
    passedLevels: user.passedLevels,
    levelDeterminationCompletedAt: user.levelDeterminationCompletedAt
  };
}

export async function register(req, res) {
  const { fullName, email, password } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (existing?.passwordHash) return res.status(409).json({ message: 'An account with that email already exists.' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = existing || new User({ email: normalizedEmail });
  user.fullName = fullName.trim();
  user.passwordHash = passwordHash;
  user.authProvider = user.googleId ? 'both' : 'local';
  await user.save();

  setAuthCookie(res, user._id.toString());
  res.status(201).json({ user: publicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email?.trim() || !password) return res.status(400).json({ message: 'Email and password are required.' });

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');
  if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'The email or password is incorrect.' });
  }

  setAuthCookie(res, user._id.toString());
  res.json({ user: publicUser(user) });
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export function logout(req, res) {
  clearAuthCookie(res);
  res.status(204).send();
}

export async function googleCallback(req, res) {
  setAuthCookie(res, req.user._id.toString());
  res.redirect(`${env.frontendUrl}/auth/callback`);
}

export async function forgotPassword(req, res) {
  const email = req.body.email?.trim().toLowerCase();
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');
  const response = { message: 'If an account exists for that email, password reset instructions have been prepared.' };

  // Google-created users may not have a local password yet. A reset link lets
  // them create one while preserving their Google sign-in connection.
  if (user) {
    const { rawToken, tokenHash } = createOpaqueToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const resetUrl = `${env.frontendUrl}/reset-password?token=${rawToken}`;
    if (isMailConfigured()) {
      try {
        await sendPasswordResetEmail({ to: user.email, fullName: user.fullName, resetUrl });
      } catch (error) {
        console.error('[password reset] email delivery failed:', error.message);
        return res.status(503).json({ message: 'We could not send the password reset email. Please try again later.' });
      }
    } else {
      console.log(`[password reset] ${resetUrl}`);
      if (env.nodeEnv !== 'production' && env.resetTokenMode === 'console') response.resetToken = rawToken;
    }
  }

  res.json(response);
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Reset token and new password are required.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() }
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpiresAt');
  if (!user) return res.status(400).json({ message: 'That reset link is invalid or has expired.' });

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.authProvider = user.googleId ? 'both' : 'local';
  await user.save();
  setAuthCookie(res, user._id.toString());
  res.json({ message: 'Your password has been reset.', user: publicUser(user) });
}

export { publicUser };
