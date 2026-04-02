import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createTestApp } from './helpers';

const prisma = new PrismaClient();
const app = createTestApp();

// Helper: register and get cookie
async function registerUser(agent: supertest.SuperAgentTest, username: string, password: string) {
  const res = await agent.post('/api/auth/register').send({ username, password });
  return res;
}

describe('Auth API - /api/auth', () => {
  beforeAll(async () => {
    // Clean test data
    await prisma.submission.deleteMany();
    await prisma.wrongAnswer.deleteMany();
    await prisma.contestQuestion.deleteMany();
    await prisma.contest.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('注册成功返回用户信息', async () => {
      const agent = supertest.agent(app);
      const res = await registerUser(agent, 'testuser1', 'password123');

      expect(res.status).toBe(201);
      expect(res.body.username).toBe('testuser1');
      expect(res.body.role).toBe('user');
      expect(res.body.password).toBeUndefined();
    });

    it('重复用户名返回 409', async () => {
      const agent = supertest.agent(app);
      await registerUser(agent, 'duplicate_test', 'password123');
      const res = await agent.post('/api/auth/register').send({ username: 'duplicate_test', password: 'password123' });

      // Should get 409 for duplicate
      expect([400, 409]).toContain(res.status);
    });

    it('缺少用户名返回 400', async () => {
      const res = await supertest(app).post('/api/auth/register').send({ password: 'password123' });
      expect(res.status).toBe(400);
    });

    it('密码太短返回 400', async () => {
      const res = await supertest(app).post('/api/auth/register').send({ username: 'shortpw', password: '12345' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      // Create a test user
      const hash = await bcrypt.hash('password123', 10);
      await prisma.user.upsert({
        where: { username: 'logintest' },
        update: { password: hash },
        create: { username: 'logintest', password: hash },
      });
    });

    it('正确凭据登录成功', async () => {
      const agent = supertest.agent(app);
      const res = await agent.post('/api/auth/login').send({ username: 'logintest', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('logintest');
    });

    it('错误密码返回 401', async () => {
      const res = await supertest(app).post('/api/auth/login').send({ username: 'logintest', password: 'wrongpassword' });
      expect(res.status).toBe(401);
    });

    it('不存在的用户名返回 401', async () => {
      const res = await supertest(app).post('/api/auth/login').send({ username: 'nonexistent', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('已登录用户返回用户信息', async () => {
      const agent = supertest.agent(app);
      await agent.post('/api/auth/login').send({ username: 'logintest', password: 'password123' });
      const res = await agent.get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('logintest');
    });

    it('未登录返回 401', async () => {
      const res = await supertest(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('登出成功', async () => {
      const agent = supertest.agent(app);
      await agent.post('/api/auth/login').send({ username: 'logintest', password: 'password123' });

      const res = await agent.post('/api/auth/logout');
      expect(res.status).toBe(200);

      // After logout, me should return 401
      const meRes = await agent.get('/api/auth/me');
      expect(meRes.status).toBe(401);
    });
  });

  describe('PUT /api/auth/password', () => {
    it('正确旧密码修改成功', async () => {
      const agent = supertest.agent(app);
      await agent.post('/api/auth/login').send({ username: 'logintest', password: 'password123' });

      const res = await agent.put('/api/auth/password').send({ oldPassword: 'password123', newPassword: 'newpassword456' });
      expect(res.status).toBe(200);

      // Login with new password
      await agent.post('/api/auth/logout');
      const loginRes = await agent.post('/api/auth/login').send({ username: 'logintest', password: 'newpassword456' });
      expect(loginRes.status).toBe(200);
    });

    it('错误旧密码返回 401', async () => {
      const agent = supertest.agent(app);
      await agent.post('/api/auth/login').send({ username: 'logintest', password: 'newpassword456' });

      const res = await agent.put('/api/auth/password').send({ oldPassword: 'wrongpassword', newPassword: 'newpass123' });
      expect(res.status).toBe(401);
    });

    it('未登录返回 401', async () => {
      const res = await supertest(app).put('/api/auth/password').send({ oldPassword: 'old', newPassword: 'new' });
      expect(res.status).toBe(401);
    });
  });

  describe('权限控制', () => {
    it('普通用户无法访问管理接口', async () => {
      const agent = supertest.agent(app);
      await agent.post('/api/auth/login').send({ username: 'logintest', password: 'newpassword456' });

      const res = await agent.get('/api/admin/stats');
      expect(res.status).toBe(403);
    });

    it('未登录无法访问受保护接口', async () => {
      const res = await supertest(app).get('/api/questions');
      expect(res.status).toBe(401);
    });
  });
});
