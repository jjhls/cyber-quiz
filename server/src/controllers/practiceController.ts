import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/helpers';
import { scoreAnswer } from './examController';

export async function getPracticeQuestions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const category = req.query.category as string;
    const difficulty = req.query.difficulty as string;
    const type = req.query.type as string;
    const search = req.query.search as string;

    const where: any = { deleted: false };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (search) where.title = { contains: search };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      data: questions.map(q => ({
        ...q,
        options: JSON.parse(q.options || '[]'),
        tags: JSON.parse(q.tags || '[]'),
      })),
      total,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error('GetPracticeQuestions error:', error);
    res.status(500).json({ message: '获取练习题目失败' });
  }
}

export async function submitPracticeAnswer(req: Request, res: Response) {
  try {
    const questionId = param(req.params, 'questionId');
    const { answer } = req.body;
    const session = req.session as any;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.deleted) {
      return res.status(404).json({ message: '题目不存在' });
    }

    const correctAnswer = JSON.parse(question.answer);
    const isCorrect = scoreAnswer(question.type, answer, correctAnswer);

    if (!isCorrect) {
      const existingWrong = await prisma.wrongAnswer.findFirst({
        where: { userId: session.userId, questionId },
      });

      if (existingWrong) {
        await prisma.wrongAnswer.update({
          where: { id: existingWrong.id },
          data: { errorCount: { increment: 1 }, updatedAt: new Date() },
        });
      } else {
        await prisma.wrongAnswer.create({
          data: {
            userId: session.userId,
            questionId,
            userAnswer: JSON.stringify(answer),
            correctAnswer: JSON.stringify(correctAnswer),
          },
        });
      }
    }

    res.json({
      correct: isCorrect,
      explanation: question.explanation,
      correctAnswer: JSON.parse(question.answer),
    });
  } catch (error: any) {
    console.error('SubmitPracticeAnswer error:', error);
    res.status(500).json({ message: '提交练习答案失败' });
  }
}
