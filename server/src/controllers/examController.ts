import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/helpers';

// ---- Safe JSON helper ----
function safeParse<T = any>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// ---- Scoring engine ----
function scoreSingleChoice(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;
  return userAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
}

function scoreMultipleChoice(userAnswer: string[], correctAnswer: string[]): boolean {
  if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
  if (userAnswer.length === 0 || correctAnswer.length === 0) return false;
  const sortedUser = [...userAnswer].map(a => a.trim().toUpperCase()).sort();
  const sortedCorrect = [...correctAnswer].map(a => a.trim().toUpperCase()).sort();
  if (sortedUser.length !== sortedCorrect.length) return false;
  return sortedUser.every((a, i) => a === sortedCorrect[i]);
}

function scoreTrueFalse(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

function scoreFillBlank(userAnswer: string, correctAnswer: string[]): boolean {
  if (!userAnswer || !Array.isArray(correctAnswer) || correctAnswer.length === 0) return false;
  const trimmed = userAnswer.trim().toLowerCase();
  return correctAnswer.some((a: string) => a.trim().toLowerCase() === trimmed);
}

export function scoreAnswer(type: string, userAnswer: any, correctAnswer: any): boolean {
  try {
    switch (type) {
      case 'single': return scoreSingleChoice(String(userAnswer ?? ''), String(correctAnswer ?? ''));
      case 'multiple': return scoreMultipleChoice(
        Array.isArray(userAnswer) ? userAnswer : [userAnswer],
        Array.isArray(correctAnswer) ? correctAnswer : safeParse(String(correctAnswer), [])
      );
      case 'truefalse': return scoreTrueFalse(String(userAnswer ?? ''), String(correctAnswer ?? ''));
      case 'fillblank': return scoreFillBlank(
        String(userAnswer ?? ''),
        Array.isArray(correctAnswer) ? correctAnswer : safeParse(String(correctAnswer), [])
      );
      default: return false;
    }
  } catch {
    return false;
  }
}

// ---- startExam ----
export async function startExam(req: Request, res: Response) {
  try {
    const contestId = param(req.params, 'contestId');
    const session = req.session as any;
    const now = new Date();

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: { contestQuestions: { include: { question: true } } },
    });

    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    // C10: Time window check (status + actual time)
    if (contest.status !== 'ongoing' || now < contest.startTime || now > contest.endTime) {
      return res.status(400).json({ message: '竞赛未开始或已结束' });
    }

    const existing = await prisma.submission.findFirst({
      where: { userId: session.userId, contestId },
    });
    if (existing) {
      return res.status(400).json({ message: '您已提交过该竞赛的答案' });
    }

    let questions = contest.contestQuestions
      .filter((cq: any) => !cq.question.deleted)
      .map((cq: any) => cq.question);

    if (contest.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    const examQuestions = questions.map((q: any) => {
      const question = {
        id: q.id,
        type: q.type,
        title: q.title,
        options: safeParse<string[]>(q.options, []),
        score: q.score,
      };

      if (contest.shuffleOptions && question.options.length > 0) {
        question.options = [...question.options].sort(() => Math.random() - 0.5);
      }

      return question;
    });

    // C9: Record startedAt in session
    session.examStartedAt = now.toISOString();
    session.examContestId = contestId;

    res.json({
      contestId: contest.id,
      title: contest.title,
      duration: contest.duration,
      totalScore: contest.totalScore,
      questions: examQuestions,
    });
  } catch (error: any) {
    console.error('StartExam error:', error);
    res.status(500).json({ message: '获取试卷失败' });
  }
}

// ---- submitExam ----
export async function submitExam(req: Request, res: Response) {
  try {
    const contestId = param(req.params, 'contestId');
    const { answers } = req.body;
    const session = req.session as any;
    const now = new Date();

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: '答案数据格式错误' });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: { contestQuestions: { include: { question: true } } },
    });

    if (!contest) {
      return res.status(404).json({ message: '竞赛不存在' });
    }

    // C10: Time window check
    if (now > contest.endTime) {
      return res.status(400).json({ message: '竞赛已结束' });
    }

    const existing = await prisma.submission.findFirst({
      where: { userId: session.userId, contestId },
    });
    if (existing) {
      return res.status(400).json({ message: '您已提交过该竞赛的答案' });
    }

    // C9: Use server-recorded start time
    const startedAt = session.examStartedAt && session.examContestId === contestId
      ? new Date(session.examStartedAt)
      : new Date(now.getTime() - (req.body.duration || 0) * 1000);
    const duration = Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000));

    // Score answers
    const questions = contest.contestQuestions
      .filter((cq: any) => !cq.question.deleted)
      .map((cq: any) => cq.question);
    let score = 0;
    let correctCount = 0;
    const wrongAnswers: any[] = [];

    for (const q of questions) {
      const userAnswer = answers[q.id];
      const correctAnswer = safeParse(q.answer, null);
      if (correctAnswer === null) continue; // skip corrupted answers

      const isCorrect = scoreAnswer(q.type, userAnswer, correctAnswer);
      if (isCorrect) {
        score += q.score;
        correctCount++;
      } else {
        wrongAnswers.push({
          userId: session.userId,
          questionId: q.id,
          contestId,
          userAnswer: JSON.stringify(userAnswer),
          correctAnswer: JSON.stringify(correctAnswer),
        });
      }
    }

    const submission = await prisma.submission.create({
      data: {
        userId: session.userId,
        contestId,
        score,
        totalScore: contest.totalScore,
        correctCount,
        totalCount: questions.length,
        duration,
        answers: JSON.stringify(answers),
        startedAt,
        submittedAt: now,
      },
    });

    // Clear exam session state
    delete session.examStartedAt;
    delete session.examContestId;

    // Save wrong answers
    for (const wa of wrongAnswers) {
      const existingWrong = await prisma.wrongAnswer.findFirst({
        where: { userId: wa.userId, questionId: wa.questionId },
      });

      if (existingWrong) {
        await prisma.wrongAnswer.update({
          where: { id: existingWrong.id },
          data: { errorCount: { increment: 1 }, updatedAt: new Date() },
        });
      } else {
        await prisma.wrongAnswer.create({ data: wa });
      }
    }

    res.json({
      id: submission.id,
      score,
      totalScore: contest.totalScore,
      correctCount,
      totalCount: questions.length,
      duration,
      wrongCount: wrongAnswers.length,
    });
  } catch (error: any) {
    console.error('SubmitExam error:', error);
    res.status(500).json({ message: '提交答案失败' });
  }
}

// ---- getExamResult ----
export async function getExamResult(req: Request, res: Response) {
  try {
    const contestId = param(req.params, 'contestId');
    const session = req.session as any;

    const submission = await prisma.submission.findFirst({
      where: { userId: session.userId, contestId },
      orderBy: { submittedAt: 'desc' },
    });

    if (!submission) {
      return res.status(404).json({ message: '未找到提交记录' });
    }

    res.json({
      score: submission.score,
      totalScore: submission.totalScore,
      correctCount: submission.correctCount,
      totalCount: submission.totalCount,
      duration: submission.duration,
      submittedAt: submission.submittedAt,
    });
  } catch (error: any) {
    console.error('GetExamResult error:', error);
    res.status(500).json({ message: '获取成绩失败' });
  }
}
