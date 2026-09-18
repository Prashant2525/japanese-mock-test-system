import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../services/tokenService.js';

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) return res.status(401).json({ message: 'Authentication required.' });

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Your session is no longer valid.' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

export function requireCompletedLevel(req, res, next) {
  if (req.user?.levelDeterminationStatus !== 'completed') {
    return res.status(403).json({
      code: 'LEVEL_DETERMINATION_REQUIRED',
      message: 'Complete the level determination assessment before accessing this area.'
    });
  }
  next();
}

