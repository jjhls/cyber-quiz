import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/helpers';

export async function getWrongBook(req: Request, res: Response) {
  try {
    const session = req.session as any;
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string || 'errorCount';

    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId: session.userId },
      orderBy: sortBy === 'date' ? { updatedAt: 'desc' } : { errorCount: 'desc' },
    });

    const questionIds = wrongAnswers.map(wa => wa.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    const result = wrongAnswers.map(wa => {
      const q = questionMap.get(wa.questionId);
      return {
        id: wa.id,
        questionId: wa.questionId,
        contestId: wa.contestId,
        userAnswer: JSON.parse(wa.userAnswer),
        correctAnswer: JSON.parse(wa.correctAnswer),
        errorCount: wa.errorCount,
        createdAt: wa.createdAt,
        updatedAt: wa.updatedAt,
        question: q ? {
          id: q.id,
          title: q.title,
          category: q.category,
          difficulty: q.difficulty,
          type: q.type,
          explanation: q.explanation,
        } : null,
      };
    });

    const filtered = category
      ? result.filter(item => item.question?.category === category)
      : result;

    res.json(filtered);
  } catch (error: any) {
    console.error('GetWrongBook error:', error);
    res.status(500).json({ message: '获取错题本失败' });
  }
}

export async function removeWrongAnswer(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const session = req.session as any;

    const wrongAnswer = await prisma.wrongAnswer.findFirst({
      where: { id, userId: session.userId },
    });

    if (!wrongAnswer) {
      return res.status(404).json({ message: '错题不存在' });
    }

    await prisma.wrongAnswer.delete({ where: { id } });
    res.json({ message: '已移除错题' });
  } catch (error: any) {
    console.error('RemoveWrongAnswer error:', error);
    res.status(500).json({ message: '移除错题失败' });
  }
}
