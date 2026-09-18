import { Router } from 'express';
import passport from 'passport';
import { env } from '../config/env.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { forgotPassword, googleCallback, login, logout, me, register, resetPassword } from '../controllers/authController.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(me));
router.post('/logout', logout);
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));

router.get('/google', (req, res, next) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.status(503).json({ message: 'Google sign-in is not configured on the server yet.' });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    return res.redirect(`${env.frontendUrl}/login?error=google_not_configured`);
  }
  return passport.authenticate('google', { session: false, failureRedirect: `${env.frontendUrl}/login?error=google_failed` })(req, res, next);
}, asyncHandler(googleCallback));

export default router;

