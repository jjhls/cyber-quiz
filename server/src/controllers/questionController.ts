import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/helpers';

export async function getQuestions(req: Request, res: Response) {
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
        answer: JSON.parse(q.answer || '""'),
        tags: JSON.parse(q.tags || '[]'),
      })),
      total,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error('GetQuestions error:', error);
    res.status(500).json({ message: '获取题目列表失败' });
  }
}

export async function getQuestion(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const question = await prisma.question.findUnique({ where: { id } });

    if (!question || question.deleted) {
      return res.status(404).json({ message: '题目不存在' });
    }

    res.json({
      ...question,
      options: JSON.parse(question.options || '[]'),
      answer: JSON.parse(question.answer || '""'),
      tags: JSON.parse(question.tags || '[]'),
    });
  } catch (error: any) {
    console.error('GetQuestion error:', error);
    res.status(500).json({ message: '获取题目失败' });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const { category, difficulty, type, title, options, answer, explanation, tags, score } = req.body;

    if (!category || !difficulty || !type || !title || !answer) {
      return res.status(400).json({ message: '缺少必填字段' });
    }

    const question = await prisma.question.create({
      data: {
        category,
        difficulty,
        type,
        title,
        options: JSON.stringify(options || []),
        answer: JSON.stringify(answer),
        explanation: explanation || '',
        tags: JSON.stringify(tags || []),
        score: score || 2,
      },
    });

    res.status(201).json({
      ...question,
      options: JSON.parse(question.options),
      answer: JSON.parse(question.answer),
      tags: JSON.parse(question.tags),
    });
  } catch (error: any) {
    console.error('CreateQuestion error:', error);
    res.status(500).json({ message: '创建题目失败' });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const { category, difficulty, type, title, options, answer, explanation, tags, score } = req.body;

    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing || existing.deleted) {
      return res.status(404).json({ message: '题目不存在' });
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(type && { type }),
        ...(title && { title }),
        ...(options !== undefined && { options: JSON.stringify(options) }),
        ...(answer !== undefined && { answer: JSON.stringify(answer) }),
        ...(explanation !== undefined && { explanation }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(score !== undefined && { score }),
      },
    });

    res.json({
      ...question,
      options: JSON.parse(question.options),
      answer: JSON.parse(question.answer),
      tags: JSON.parse(question.tags),
    });
  } catch (error: any) {
    console.error('UpdateQuestion error:', error);
    res.status(500).json({ message: '更新题目失败' });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: '题目不存在' });
    }

    await prisma.question.update({ where: { id }, data: { deleted: true } });
    res.json({ message: '题目已删除' });
  } catch (error: any) {
    console.error('DeleteQuestion error:', error);
    res.status(500).json({ message: '删除题目失败' });
  }
}

export async function importQuestions(req: Request, res: Response) {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: '题目数据不能为空' });
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      try {
        if (!q.category || !q.difficulty || !q.type || !q.title || !q.answer) {
          errors.push(`第 ${i + 1} 行: 缺少必填字段`);
          failCount++;
          continue;
        }

        await prisma.question.create({
          data: {
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
            title: q.title,
            options: JSON.stringify(q.options || []),
            answer: JSON.stringify(q.answer),
            explanation: q.explanation || '',
            tags: JSON.stringify(q.tags || []),
            score: q.score || 2,
          },
        });
        successCount++;
      } catch (err: any) {
        errors.push(`第 ${i + 1} 行: ${err.message}`);
        failCount++;
      }
    }

    res.json({
      message: `导入完成`,
      successCount,
      failCount,
      errors: errors.slice(0, 20),
    });
  } catch (error: any) {
    console.error('ImportQuestions error:', error);
    res.status(500).json({ message: '批量导入失败' });
  }
}
