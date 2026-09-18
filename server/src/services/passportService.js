import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export function configurePassport() {
  if (!env.googleClientId || !env.googleClientSecret) {
    console.warn('Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.');
    return passport;
  }

  passport.use(new GoogleStrategy({
    clientID: env.googleClientId,
    clientSecret: env.googleClientSecret,
    callbackURL: env.googleCallbackUrl
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();
      if (!email) return done(new Error('Google did not provide an email address.'));

      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] }).select('+passwordHash');
      if (!user) {
        user = await User.create({
          fullName: profile.displayName || 'Dream learner',
          email,
          googleId: profile.id,
          authProvider: 'google'
        });
      } else {
        user.googleId = profile.id;
        user.authProvider = user.passwordHash ? 'both' : 'google';
        if (!user.fullName && profile.displayName) user.fullName = profile.displayName;
        await user.save();
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  }));

  return passport;
}
