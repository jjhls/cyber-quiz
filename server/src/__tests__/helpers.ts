import express from 'express';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Controllers
import * as authController from '../controllers/authController';
import * as questionController from '../controllers/questionController';
import * as contestController from '../controllers/contestController';
import * as examController from '../controllers/examController';
import * as practiceController from '../controllers/practiceController';
import * as wrongBookController from '../controllers/wrongBookController';
import * as statsController from '../controllers/statsController';
import * as userController from '../controllers/userController';

import { requireAuth, requireAdmin } from '../middleware/auth';

export function createTestApp() {
  const app = express();

  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  }));

  // Health
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  // Auth
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.get('/api/auth/me', authController.getMe);
  app.post('/api/auth/logout', authController.logout);
  app.put('/api/auth/password', requireAuth, authController.changePassword);

  // Questions
  app.get('/api/questions', requireAuth, questionController.getQuestions);
  app.get('/api/questions/:id', requireAuth, questionController.getQuestion);
  app.post('/api/questions', requireAdmin, questionController.createQuestion);
  app.put('/api/questions/:id', requireAdmin, questionController.updateQuestion);
  app.delete('/api/questions/:id', requireAdmin, questionController.deleteQuestion);
  app.post('/api/questions/import', requireAdmin, questionController.importQuestions);

  // Contests
  app.get('/api/contests', requireAuth, contestController.getContests);
  app.get('/api/contests/:id', requireAuth, contestController.getContest);
  app.post('/api/contests', requireAdmin, contestController.createContest);
  app.put('/api/contests/:id', requireAdmin, contestController.updateContest);
  app.delete('/api/contests/:id', requireAdmin, contestController.deleteContest);
  app.get('/api/contests/:id/ranking', requireAuth, contestController.getContestRanking);

  // Exams
  app.get('/api/exams/:contestId/start', requireAuth, examController.startExam);
  app.post('/api/exams/:contestId/submit', requireAuth, examController.submitExam);
  app.get('/api/exams/:contestId/result', requireAuth, examController.getExamResult);

  // Practice
  app.get('/api/practice', requireAuth, practiceController.getPracticeQuestions);
  app.post('/api/practice/:questionId/answer', requireAuth, practiceController.submitPracticeAnswer);

  // Wrong Book
  app.get('/api/wrong-book', requireAuth, wrongBookController.getWrongBook);
  app.delete('/api/wrong-book/:id', requireAuth, wrongBookController.removeWrongAnswer);

  // Stats
  app.get('/api/stats/dashboard', requireAuth, statsController.getDashboard);
  app.get('/api/stats/overview', requireAuth, statsController.getStatsOverview);
  app.get('/api/stats/category', requireAuth, statsController.getCategoryStats);
  app.get('/api/admin/stats', requireAdmin, statsController.getAdminStats);

  // Users
  app.get('/api/users', requireAdmin, userController.getUsers);
  app.put('/api/users/:id', requireAdmin, userController.updateUser);

  return app;
}
