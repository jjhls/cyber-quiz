import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

export async function getDashboard(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const now = new Date();

    const [ongoingContests, upcomingContests, submissions, nextContest] = await Promise.all([
      // Ongoing contests count
      prisma.contest.count({
        where: {
          status: 'ongoing',
          startTime: { lte: now },
          endTime: { gt: now },
        },
      }),
      // Upcoming contests count
      prisma.contest.count({
        where: {
          status: 'upcoming',
          startTime: { gt: now },
        },
      }),
      // User's submissions with scores
      prisma.submission.findMany({
        where: { userId: session.userId },
        orderBy: { submittedAt: 'desc' },
        take: 20,
        include: { contest: { select: { title: true, totalScore: true } } },
      }),
      // Next upcoming contest
      prisma.contest.findFirst({
        where: {
          startTime: { gt: now },
          status: { in: ['upcoming', 'ongoing'] },
        },
        orderBy: { startTime: 'asc' },
      }),
    ]);

    // Calculate total submissions and avg score
    const totalSubmissions = submissions.length;
    const avgScore = totalSubmissions > 0
      ? submissions.reduce((sum, s) => sum + s.score, 0) / totalSubmissions
      : 0;

    // Calculate user ranking (by total score across all submissions)
    const allUsersScores = await prisma.submission.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: { _sum: { score: 'desc' } },
    });
    const userRank = allUsersScores.findIndex(s => s.userId === session.userId) + 1;
    const totalUsers = await prisma.user.count();

    res.json({
      ongoingContests,
      upcomingContests,
      totalSubmissions,
      avgScore: Math.round(avgScore * 10) / 10,
      userRank: userRank || totalUsers,
      totalUsers,
      nextContest: nextContest ? {
        id: nextContest.id,
        title: nextContest.title,
        startTime: nextContest.startTime,
      } : null,
      recentSubmissions: submissions.slice(0, 5).map(s => ({
        id: s.id,
        contestTitle: s.contest.title,
        score: s.score,
        totalScore: s.totalScore,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error: any) {
    console.error('GetDashboard error:', error);
    res.status(500).json({ message: '获取仪表盘数据失败' });
  }
}

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
    const questionIds = wrongAnswers.map(wa => wa.questionId);
    if (questionIds.length > 0) {
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, category: true },
      });
      const questionMap = new Map(questions.map(q => [q.id, q.category]));

      for (const wa of wrongAnswers) {
        const category = questionMap.get(wa.questionId);
        if (category) {
          categoryErrors[category] = (categoryErrors[category] || 0) + wa.errorCount;
        }
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
