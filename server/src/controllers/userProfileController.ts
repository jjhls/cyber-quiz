import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Get user profile with stats
export async function getProfile(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        role: true,
        avatar: true,
        experience: true,
        level: true,
        consecutiveDays: true,
        lastLoginDate: true,
        dailyGoals: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // Calculate level progress
    const levelThresholds = [0, 100, 300, 600, 1000, 1500];
    const currentThreshold = levelThresholds[user.level - 1] || 0;
    const nextThreshold = levelThresholds[user.level] || levelThresholds[levelThresholds.length - 1];
    const progress = Math.min(100, Math.round(((user.experience - currentThreshold) / (nextThreshold - currentThreshold)) * 100));

    res.json({
      ...user,
      dailyGoals: JSON.parse(user.dailyGoals || '{}'),
      levelProgress: {
        current: user.experience,
        currentThreshold,
        nextThreshold,
        progress,
      },
    });
  } catch (error: any) {
    console.error('GetProfile error:', error);
    res.status(500).json({ message: '获取用户资料失败' });
  }
}

// Update experience after answering questions
export async function addExperience(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const { correct, count } = req.body;

    if (typeof count !== 'number' || count <= 0) {
      return res.status(400).json({ message: '无效的题目数量' });
    }

    const expPerCorrect = 10;
    const expPerWrong = 2;
    const correctCount = correct || 0;
    const wrongCount = count - correctCount;
    const expGain = correctCount * expPerCorrect + wrongCount * expPerWrong;

    const levelThresholds = [0, 100, 300, 600, 1000, 1500];

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return res.status(404).json({ message: '用户不存在' });

    const newExp = user.experience + expGain;
    let newLevel = user.level;
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (newExp >= levelThresholds[i]) {
        newLevel = i + 1;
        break;
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: { experience: newExp, level: newLevel },
    });

    res.json({
      experience: updated.experience,
      level: updated.level,
      expGain,
    });
  } catch (error: any) {
    console.error('AddExperience error:', error);
    res.status(500).json({ message: '增加经验值失败' });
  }
}

// Upload avatar
export async function uploadAvatar(req: Request, res: Response) {
  try {
    const session = req.session as any;

    if (!req.file) {
      return res.status(400).json({ message: '未上传文件' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar if exists
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (user?.avatar) {
      const oldPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { avatar: avatarUrl },
    });

    res.json({ avatar: avatarUrl });
  } catch (error: any) {
    console.error('UploadAvatar error:', error);
    res.status(500).json({ message: '上传头像失败' });
  }
}

// Get daily goals
export async function getDailyGoals(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { dailyGoals: true },
    });

    if (!user) return res.status(404).json({ message: '用户不存在' });

    const goals = JSON.parse(user.dailyGoals || '{}');

    // Reset goals if it's a new day
    const today = new Date().toDateString();
    if (goals.date !== today) {
      const defaultGoals = {
        date: today,
        practice: { current: 0, target: 5 },
        contest: { current: 0, target: 1 },
        review: { current: 0, target: 3 },
      };
      await prisma.user.update({
        where: { id: session.userId },
        data: { dailyGoals: JSON.stringify(defaultGoals) },
      });
      return res.json(defaultGoals);
    }

    res.json(goals);
  } catch (error: any) {
    console.error('GetDailyGoals error:', error);
    res.status(500).json({ message: '获取每日目标失败' });
  }
}

// Update daily goal progress
export async function updateDailyGoal(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const { type } = req.body; // 'practice', 'contest', 'review'

    if (!['practice', 'contest', 'review'].includes(type)) {
      return res.status(400).json({ message: '无效的目标类型' });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return res.status(404).json({ message: '用户不存在' });

    const goals = JSON.parse(user.dailyGoals || '{}');
    const today = new Date().toDateString();

    // Reset if new day
    if (goals.date !== today) {
      goals.date = today;
      goals.practice = { current: 0, target: 5 };
      goals.contest = { current: 0, target: 1 };
      goals.review = { current: 0, target: 3 };
    }

    if (goals[type]) {
      goals[type].current = Math.min((goals[type].current || 0) + 1, goals[type].target);
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: { dailyGoals: JSON.stringify(goals) },
    });

    res.json(goals);
  } catch (error: any) {
    console.error('UpdateDailyGoal error:', error);
    res.status(500).json({ message: '更新目标失败' });
  }
}

// Get user stats trend (for dashboard cards)
export async function getStatsTrend(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    const [todaySubmissions, yesterdaySubmissions, totalSubmissions, avgScoreData] = await Promise.all([
      prisma.submission.count({
        where: { userId: session.userId, submittedAt: { gte: todayStart } },
      }),
      prisma.submission.count({
        where: { userId: session.userId, submittedAt: { gte: yesterdayStart, lt: todayStart } },
      }),
      prisma.submission.count({
        where: { userId: session.userId },
      }),
      prisma.submission.aggregate({
        where: { userId: session.userId },
        _avg: { score: true },
        _count: true,
      }),
    ]);

    // Get user ranking
    const allUsersScores = await prisma.submission.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
    });
    const userRank = allUsersScores.findIndex(s => s.userId === session.userId) + 1;
    const totalUsers = await prisma.user.count();

    res.json({
      todaySubmissions,
      yesterdaySubmissions,
      submissionTrend: todaySubmissions - yesterdaySubmissions,
      totalSubmissions,
      avgScore: Math.round((avgScoreData._avg.score || 0) * 10) / 10,
      userRank: userRank || totalUsers,
      totalUsers,
    });
  } catch (error: any) {
    console.error('GetStatsTrend error:', error);
    res.status(500).json({ message: '获取趋势数据失败' });
  }
}
