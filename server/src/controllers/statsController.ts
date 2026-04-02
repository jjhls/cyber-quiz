import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getStatsOverview(req: Request, res: Response) {
  try {
    const session = req.session as any;

    const [totalSubmissions, avgScore, totalContests] = await Promise.all([
      prisma.submission.count({ where: { userId: session.userId } }),
      prisma.submission.aggregate({
        where: { userId: session.userId },
        _avg: { score: true },
      }),
      prisma.contest.count({ where: { status: 'finished' } }),
    ]);

    res.json({
      totalSubmissions,
      avgScore: avgScore._avg.score || 0,
      totalContests,
    });
  } catch (error: any) {
    console.error('GetStatsOverview error:', error);
    res.status(500).json({ message: '获取统计数据失败' });
  }
}

export async function getCategoryStats(req: Request, res: Response) {
  try {
    const session = req.session as any;

    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId: session.userId },
    });

    const categoryErrors: Record<string, number> = {};
    for (const wa of wrongAnswers) {
      const question = await prisma.question.findUnique({ where: { id: wa.questionId } });
      if (question) {
        categoryErrors[question.category] = (categoryErrors[question.category] || 0) + wa.errorCount;
      }
    }

    res.json({ categoryErrors });
  } catch (error: any) {
    console.error('GetCategoryStats error:', error);
    res.status(500).json({ message: '获取分类统计失败' });
  }
}

export async function getAdminStats(req: Request, res: Response) {
  try {
    const [totalUsers, totalQuestions, totalContests, totalSubmissions] = await Promise.all([
      prisma.user.count(),
      prisma.question.count({ where: { deleted: false } }),
      prisma.contest.count(),
      prisma.submission.count(),
    ]);

    res.json({
      totalUsers,
      totalQuestions,
      totalContests,
      totalSubmissions,
    });
  } catch (error: any) {
    console.error('GetAdminStats error:', error);
    res.status(500).json({ message: '获取管理统计失败' });
  }
}
