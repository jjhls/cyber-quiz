import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createTestApp } from './helpers';

const prisma = new PrismaClient();
const app = createTestApp();

let adminCookie: string;
let userCookie: string;
let testContestId: string;
let testQuestionIds: string[] = [];

async function loginAsAdmin() {
  const agent = supertest.agent(app);
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin_exam_test' },
    update: { password: hash, role: 'admin' },
    create: { username: 'admin_exam_test', password: hash, role: 'admin' },
  });
  const res = await agent.post('/api/auth/login').send({ username: 'admin_exam_test', password: 'admin123' });
  return agent;
}

async function loginAsUser() {
  const agent = supertest.agent(app);
  const hash = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { username: 'user_exam_test' },
    update: { password: hash, role: 'user' },
    create: { username: 'user_exam_test', password: hash, role: 'user' },
  });
  const res = await agent.post('/api/auth/login').send({ username: 'user_exam_test', password: 'user123' });
  return agent;
}

describe('Exam API - /api/exams', () => {
  beforeAll(async () => {
    // Clean test data
    await prisma.submission.deleteMany();
    await prisma.wrongAnswer.deleteMany();
    await prisma.contestQuestion.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.question.deleteMany({ where: { title: { startsWith: 'ETEST' } } });

    // Create test questions via direct DB
    testQuestionIds = [];
    const questions = [
      { category: 'Web安全', difficulty: 'easy', type: 'single', title: 'ETEST SQL注入属于什么攻击?', options: JSON.stringify(['A.注入攻击', 'B.XSS攻击', 'C.CSRF攻击', 'D.中间人攻击']), answer: JSON.stringify('A.注入攻击'), tags: JSON.stringify(['SQL注入']), score: 2 },
      { category: '密码学', difficulty: 'medium', type: 'multiple', title: 'ETEST 以下哪些是加密算法?', options: JSON.stringify(['A.AES', 'B.RSA', 'C.SQL', 'D.DES']), answer: JSON.stringify(['A.AES', 'B.RSA', 'D.DES']), tags: JSON.stringify(['加密']), score: 3 },
      { category: '安全', difficulty: 'easy', type: 'truefalse', title: 'ETEST HTTPS比HTTP更安全', answer: JSON.stringify('正确'), options: JSON.stringify([]), tags: JSON.stringify(['HTTPS']), score: 2 },
      { category: '杂项', difficulty: 'easy', type: 'fillblank', title: 'ETEST Linux下查看IP地址的命令是?', answer: JSON.stringify(['ifconfig', 'ip addr']), options: JSON.stringify([]), tags: JSON.stringify(['Linux']), score: 3 },
    ];

    for (const q of questions) {
      const created = await prisma.question.create({ data: q });
      testQuestionIds.push(created.id);
    }

    // Create test contest via direct DB
    const now = new Date();
    const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await prisma.contest.create({
      data: {
        title: 'ETEST 竞赛',
        description: '用于测试的竞赛',
        startTime: now,
        endTime: future,
        duration: 60,
        totalScore: 10,
        status: 'ongoing',
        shuffleQuestions: false,
        shuffleOptions: false,
        contestQuestions: {
          create: testQuestionIds.map((id, idx) => ({ questionId: id, sortOrder: idx })),
        },
      },
    });
  });

  describe('Exam lifecycle: start → submit → result', () => {
    it('从数据库获取测试竞赛', async () => {
      const contest = await prisma.contest.findFirst({ where: { title: 'ETEST 竞赛' } });
      expect(contest).not.toBeNull();
      testContestId = contest!.id;
    });

    it('获取试卷 - 返回题目列表', async () => {
      const user = await loginAsUser();
      const res = await user.get(`/api/exams/${testContestId}/start`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('ETEST 竞赛');
      expect(res.body.questions).toHaveLength(4);
      expect(res.body.duration).toBe(60);

      // Verify question fields
      const q = res.body.questions[0];
      expect(q.id).toBeDefined();
      expect(q.type).toBeDefined();
      expect(q.title).toBeDefined();
      expect(q.score).toBeGreaterThan(0);
    });

    it('提交正确答案 - 得高分', async () => {
      // Get the correct answers
      const questions = await prisma.question.findMany({ where: { id: { in: testQuestionIds } } });
      const answers: Record<string, any> = {};

      for (const q of questions) {
        const correctAnswer = JSON.parse(q.answer);
        // fillblank expects a single string that matches one correct answer
        if (q.type === 'fillblank' && Array.isArray(correctAnswer)) {
          answers[q.id] = correctAnswer[0];
        } else {
          answers[q.id] = correctAnswer;
        }
      }

      const user = await loginAsUser();
      const res = await user.post(`/api/exams/${testContestId}/submit`).send({
        answers,
        duration: 120,
      });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(10); // 2+3+2+3=10 total
      expect(res.body.correctCount).toBe(4);
      expect(res.body.totalCount).toBe(4);
      expect(res.body.wrongCount).toBe(0);
    });

    it('重复提交返回 400', async () => {
      const user = await loginAsUser();
      const res = await user.post(`/api/exams/${testContestId}/submit`).send({
        answers: {},
        duration: 60,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('已提交');
    });

    it('查看成绩', async () => {
      const user = await loginAsUser();
      const res = await user.get(`/api/exams/${testContestId}/result`);

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(10);
      expect(res.body.correctCount).toBe(4);
    });
  });

  describe('Exam with wrong answers', () => {
    let wrongTestContestId: string;

    beforeAll(async () => {
      // Create another contest with same questions
      const now = new Date();
      const future = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const contest = await prisma.contest.create({
        data: {
          title: '错题测试竞赛',
          description: '测试错题收集',
          startTime: now,
          endTime: future,
          duration: 60,
          totalScore: 10,
          status: 'ongoing',
          shuffleQuestions: false,
          shuffleOptions: false,
          contestQuestions: {
            create: testQuestionIds.map((id, idx) => ({ questionId: id, sortOrder: idx })),
          },
        },
      });
      wrongTestContestId = contest.id;
    });

    it('提交错误答案 - 收集错题', async () => {
      const questions = await prisma.question.findMany({ where: { id: { in: testQuestionIds } } });
      const answers: Record<string, any> = {};

      // Intentionally answer wrong
      for (const q of questions) {
        if (q.type === 'single') answers[q.id] = '错误选项';
        else if (q.type === 'multiple') answers[q.id] = ['C.SQL'];
        else if (q.type === 'truefalse') answers[q.id] = '错误';
        else if (q.type === 'fillblank') answers[q.id] = 'wrongcommand';
      }

      const user = await loginAsUser();
      const res = await user.post(`/api/exams/${wrongTestContestId}/submit`).send({
        answers,
        duration: 30,
      });

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(0);
      expect(res.body.correctCount).toBe(0);
      expect(res.body.wrongCount).toBe(4);
    });

    it('错题本包含答错的题目', async () => {
      const user = await loginAsUser();
      const res = await user.get('/api/wrong-book');

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('Exam protection', () => {
    it('未登录无法获取试卷', async () => {
      const res = await supertest(app).get(`/api/exams/${testContestId}/start`);
      expect(res.status).toBe(401);
    });

    it('未登录无法提交答案', async () => {
      const res = await supertest(app).post(`/api/exams/${testContestId}/submit`).send({ answers: {} });
      expect(res.status).toBe(401);
    });

    it('无效竞赛ID返回 404', async () => {
      const user = await loginAsUser();
      const res = await user.get('/api/exams/nonexistent-id/start');
      expect(res.status).toBe(404);
    });
  });
});
