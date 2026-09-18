import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import { env } from './config/env.js';
import { configurePassport } from './services/passportService.js';
import authRoutes from './routes/authRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import mockTestRoutes from './routes/mockTestRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

configurePassport();

const app = express();
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(passport.initialize());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'dream-mock-test-system-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/results', attemptRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

