# Dream Mock Test System

MERN application for Japanese-language learners and exam candidates.

## Requirements

- Node.js 20+
- MongoDB running locally or a MongoDB connection string
- Google OAuth credentials for Google sign-in

## Local setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Add Google OAuth credentials when Google sign-in is needed.
3. Run `npm run install:all`.
4. Run `npm run seed` to load clearly labeled demo courses, questions, and tests.
5. Run `npm run dev`.

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5000`.

The assessment threshold and scoring defaults live in `server/src/config/assessmentConfig.js` so they can be changed without rewriting controllers or UI.

Password reset emails use Gmail SMTP when `MAIL_HOST`, `MAIL_USER`, `MAIL_APP_PASSWORD`, and `MAIL_FROM` are configured in `server/.env`. Gmail App Passwords require 2-Step Verification. If mail settings are absent in development, the reset URL falls back to the local console flow.
