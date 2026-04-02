import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/helpers';

export async function getContests(req: Request, res: Response) {
  try {
    const status = req.query.status as string;
    const where: any = {};
    if (status) where.status = status;

    const contests = await prisma.contest.findMany({
      where,
      orderBy: { startTime: 'desc' },
      include: { contestQuestions: { select: { questionId: true } } },
    });

    res.json(contests.map(c => ({
      ...c,
      questionIds: c.contestQuestions.map((cq: any) => cq.questionId),
      contestQuestions: undefined,
    })));
  } catch (error: any) {
    console.error('GetContests error:', error);
    res.status(500).json({ message: '获取竞赛列表失败' });
  }
}

export async function getContest(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const contest = await prisma.contest.findUnique({
      where: { id },
      include: { contestQuestions: { include: { question: true } } },
    });

    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    res.json({
      ...contest,
      questionIds: contest.contestQuestions.map((cq: any) => cq.questionId),
      questions: contest.contestQuestions.map((cq: any) => cq.question),
      contestQuestions: undefined,
    });
  } catch (error: any) {
    console.error('GetContest error:', error);
    res.status(500).json({ message: '获取竞赛详情失败' });
  }
}

export async function createContest(req: Request, res: Response) {
  try {
    const { title, description, startTime, endTime, duration, questionIds, shuffleQuestions, shuffleOptions } = req.body;

    if (!title || !startTime || !endTime || !duration || !questionIds || !Array.isArray(questionIds)) {
      return res.status(400).json({ message: '缺少必填字段' });
    }

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds }, deleted: false },
      select: { score: true },
    });

    const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

    const contest = await prisma.contest.create({
      data: {
        title,
        description: description || '',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        totalScore,
        shuffleQuestions: shuffleQuestions || false,
        shuffleOptions: shuffleOptions || false,
        contestQuestions: {
          create: questionIds.map((qid: string, idx: number) => ({
            questionId: qid,
            sortOrder: idx,
          })),
        },
      },
    });

    res.status(201).json(contest);
  } catch (error: any) {
    console.error('CreateContest error:', error);
    res.status(500).json({ message: '创建竞赛失败' });
  }
}

export async function updateContest(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const { title, description, startTime, endTime, duration, questionIds, shuffleQuestions, shuffleOptions, status } = req.body;

    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (duration !== undefined) updateData.duration = duration;
    if (shuffleQuestions !== undefined) updateData.shuffleQuestions = shuffleQuestions;
    if (shuffleOptions !== undefined) updateData.shuffleOptions = shuffleOptions;
    if (status !== undefined) updateData.status = status;

    if (questionIds && Array.isArray(questionIds)) {
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds }, deleted: false },
        select: { score: true },
      });
      updateData.totalScore = questions.reduce((sum, q) => sum + q.score, 0);

      // W11: Use transaction to ensure atomic question reassignment
      await prisma.$transaction([
        prisma.contestQuestion.deleteMany({ where: { contestId: id } }),
        prisma.contestQuestion.createMany({
          data: questionIds.map((qid: string, idx: number) => ({
            contestId: id,
            questionId: qid,
            sortOrder: idx,
          })),
        }),
      ]);
    }

    const contest = await prisma.contest.update({
      where: { id },
      data: updateData,
    });

    res.json(contest);
  } catch (error: any) {
    console.error('UpdateContest error:', error);
    res.status(500).json({ message: '更新竞赛失败' });
  }
}

export async function deleteContest(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const existing = await prisma.contest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    await prisma.contest.delete({ where: { id } });
    res.json({ message: '竞赛已删除' });
  } catch (error: any) {
    console.error('DeleteContest error:', error);
    res.status(500).json({ message: '删除竞赛失败' });
  }
}

export async function getContestRanking(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');

    const submissions = await prisma.submission.findMany({
      where: { contestId: id },
      include: { user: { select: { username: true } } },
      orderBy: [{ score: 'desc' }, { duration: 'asc' }],
    });

    const ranking = submissions.map((s, idx) => ({
      rank: idx + 1,
      userId: s.userId,
      username: s.user.username,
      score: s.score,
      totalScore: s.totalScore,
      correctCount: s.correctCount,
      totalCount: s.totalCount,
      duration: s.duration,
      submittedAt: s.submittedAt,
    }));

    res.json(ranking);
  } catch (error: any) {
    console.error('GetContestRanking error:', error);
    res.status(500).json({ message: '获取排行榜失败' });
  }
}
