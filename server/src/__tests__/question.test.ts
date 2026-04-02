import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createTestApp } from './helpers';

const prisma = new PrismaClient();
const app = createTestApp();

async function loginAsAdmin() {
  const agent = supertest.agent(app);
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin_qtest' },
    update: { password: hash, role: 'admin' },
    create: { username: 'admin_qtest', password: hash, role: 'admin' },
  });
  await agent.post('/api/auth/login').send({ username: 'admin_qtest', password: 'admin123' });
  return agent;
}

async function loginAsUser() {
  const agent = supertest.agent(app);
  const hash = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { username: 'user_qtest' },
    update: { password: hash, role: 'user' },
    create: { username: 'user_qtest', password: hash, role: 'user' },
  });
  await agent.post('/api/auth/login').send({ username: 'user_qtest', password: 'user123' });
  return agent;
}

describe('Question API - /api/questions', () => {
  beforeAll(async () => {
    await prisma.submission.deleteMany();
    await prisma.wrongAnswer.deleteMany();
    await prisma.contestQuestion.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.question.deleteMany({ where: { title: { startsWith: 'QTEST' } } });
  });

  describe('CRUD operations', () => {
    let questionId: string;

    it('管理员创建题目', async () => {
      const admin = await loginAsAdmin();
      const res = await admin.post('/api/questions').send({
        category: 'Web安全',
        difficulty: 'easy',
        type: 'single',
        title: 'QTEST: SQL注入测试题',
        options: ['A', 'B', 'C', 'D'],
        answer: 'A',
        explanation: 'A是正确答案',
        tags: ['SQL'],
        score: 2,
      });

      expect(res.status).toBe(201);
      expect(res.body.title).toContain('QTEST');
      questionId = res.body.id;
    });

    it('获取题目详情', async () => {
      const admin = await loginAsAdmin();
      const res = await admin.get(`/api/questions/${questionId}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toContain('QTEST');
      expect(res.body.options).toEqual(['A', 'B', 'C', 'D']);
    });

    it('更新题目', async () => {
      const admin = await loginAsAdmin();
      const res = await admin.put(`/api/questions/${questionId}`).send({
        title: 'QTEST: 更新后的题目',
        category: 'Web安全',
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toContain('更新后');
    });

    it('软删除题目', async () => {
      const admin = await loginAsAdmin();
      const res = await admin.delete(`/api/questions/${questionId}`);

      expect(res.status).toBe(200);

      // Should not appear in list
      const listRes = await admin.get('/api/questions');
      const found = listRes.body.data.find((q: any) => q.id === questionId);
      expect(found).toBeUndefined();
    });

    it('普通用户无法创建题目', async () => {
      const user = await loginAsUser();
      const res = await user.post('/api/questions').send({
        category: 'Web安全',
        difficulty: 'easy',
        type: 'single',
        title: 'QTEST: 无权创建',
        options: ['A', 'B'],
        answer: 'A',
        tags: [],
        score: 2,
      });

      expect(res.status).toBe(403);
    });
  });

  describe('Pagination', () => {
    it('获取题目列表支持分页', async () => {
      const admin = await loginAsAdmin();
      const res = await admin.get('/api/questions?page=1&pageSize=2');

      expect(res.status).toBe(200);
      expect(res.body.page).toBe(1);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.total).toBeGreaterThanOrEqual(0);
    });
  });
});
