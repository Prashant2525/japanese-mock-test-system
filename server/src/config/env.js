import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

const required = ['MONGODB_URI', 'JWT_SECRET'];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  cookieName: process.env.COOKIE_NAME || 'dream_access_token',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  resetTokenMode: process.env.RESET_TOKEN_MODE || 'console',
  mailHost: process.env.MAIL_HOST,
  mailPort: Number(process.env.MAIL_PORT || 465),
  mailSecure: String(process.env.MAIL_SECURE || 'true').toLowerCase() === 'true',
  mailUser: process.env.MAIL_USER,
  mailAppPassword: process.env.MAIL_APP_PASSWORD,
  mailFrom: process.env.MAIL_FROM || process.env.MAIL_USER
};

export function assertEnvironment() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
