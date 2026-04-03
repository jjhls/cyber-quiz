import express from 'express';
import cors from 'cors';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

// Controllers
import * as authController from './controllers/authController';
import * as questionController from './controllers/questionController';
import * as contestController from './controllers/contestController';
import * as examController from './controllers/examController';
import * as practiceController from './controllers/practiceController';
import * as wrongBookController from './controllers/wrongBookController';
import * as statsController from './controllers/statsController';
import * as userController from './controllers/userController';
import * as userProfileController from './controllers/userProfileController';

// Middleware
import { requireAuth, requireAdmin } from './middleware/auth';
import { rateLimitAuth } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 4000;

// SQLite session store
const SQLiteStore = SQLiteStoreFactory(session);

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files for avatars
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Session configuration
const isProd = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET && isProd) {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

app.use(session({
  store: new SQLiteStore({
    db: 'sessions.db',
    dir: dataDir,
  }) as any,
  secret: process.env.SESSION_SECRET || 'dev-secret-do-not-use-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== Auth Routes ====================
app.post('/api/auth/register', rateLimitAuth, authController.register);
app.post('/api/auth/login', rateLimitAuth, authController.login);
app.get('/api/auth/me', authController.getMe);
app.post('/api/auth/logout', authController.logout);
app.put('/api/auth/password', requireAuth, authController.changePassword);

// ==================== User Profile Routes ====================
app.get('/api/user/profile', requireAuth, userProfileController.getProfile);
app.post('/api/user/experience', requireAuth, userProfileController.addExperience);
app.put('/api/user/avatar', requireAuth, userProfileController.setAvatar);
app.get('/api/avatars', requireAuth, userProfileController.getAvatars);
app.get('/api/user/history', requireAuth, userProfileController.getUserHistory);
app.get('/api/user/answers', requireAuth, userProfileController.getUserAnswers);
app.get('/api/user/daily-goals', requireAuth, userProfileController.getDailyGoals);
app.put('/api/user/daily-goals', requireAuth, userProfileController.updateDailyGoal);
app.get('/api/user/stats/trend', requireAuth, userProfileController.getStatsTrend);
app.get('/api/user/practice-stats', requireAuth, userProfileController.getPracticeStats);

// ==================== Question Routes ====================
app.get('/api/questions', requireAuth, questionController.getQuestions);
app.get('/api/questions/:id', requireAuth, questionController.getQuestion);
app.post('/api/questions', requireAdmin, questionController.createQuestion);
app.put('/api/questions/:id', requireAdmin, questionController.updateQuestion);
app.delete('/api/questions/:id', requireAdmin, questionController.deleteQuestion);
app.post('/api/questions/import', requireAdmin, questionController.importQuestions);

// ==================== Contest Routes ====================
app.get('/api/contests', requireAuth, contestController.getContests);
app.get('/api/contests/:id', requireAuth, contestController.getContest);
app.post('/api/contests', requireAdmin, contestController.createContest);
app.put('/api/contests/:id', requireAdmin, contestController.updateContest);
app.delete('/api/contests/:id', requireAdmin, contestController.deleteContest);
app.get('/api/contests/:id/ranking', requireAuth, contestController.getContestRanking);

// ==================== Exam Routes ====================
app.get('/api/exams/:contestId/start', requireAuth, examController.startExam);
app.post('/api/exams/:contestId/submit', requireAuth, examController.submitExam);
app.get('/api/exams/:contestId/result', requireAuth, examController.getExamResult);

// ==================== Practice Routes ====================
app.get('/api/practice', requireAuth, practiceController.getPracticeQuestions);
app.post('/api/practice/:questionId/answer', requireAuth, practiceController.submitPracticeAnswer);

// ==================== Wrong Book Routes ====================
app.get('/api/wrong-book', requireAuth, wrongBookController.getWrongBook);
app.delete('/api/wrong-book/:id', requireAuth, wrongBookController.removeWrongAnswer);

// ==================== Stats Routes ====================
app.get('/api/stats/dashboard', requireAuth, statsController.getDashboard);
app.get('/api/stats/overview', requireAuth, statsController.getStatsOverview);
app.get('/api/stats/category', requireAuth, statsController.getCategoryStats);
app.get('/api/admin/stats', requireAdmin, statsController.getAdminStats);

// ==================== User Routes ====================
app.get('/api/users', requireAdmin, userController.getUsers);
app.put('/api/users/:id', requireAdmin, userController.updateUser);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
