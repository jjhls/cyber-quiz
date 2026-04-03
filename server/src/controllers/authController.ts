import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

export async function register(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度不能少于6位' });
    }

    // Check if username exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: '用户名已存在' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
      select: { id: true, username: true, role: true, avatar: true, createdAt: true },
    });

    // Set session
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;
    (req.session as any).role = user.role;
    (req.session as any).avatar = user.avatar;

    res.status(201).json(user);
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // Update consecutive login days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let consecutiveDays = 1;
    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      lastLogin.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        consecutiveDays = user.consecutiveDays + 1;
      } else if (diffDays > 1) {
        consecutiveDays = 1;
      } else {
        consecutiveDays = user.consecutiveDays; // Same day, don't increment
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        consecutiveDays,
        lastLoginDate: today,
      },
    });

    // Set session
    (req.session as any).userId = user.id;
    (req.session as any).username = user.username;
    (req.session as any).role = user.role;
    (req.session as any).avatar = user.avatar;

    res.json({ id: user.id, username: user.username, role: user.role, avatar: user.avatar, consecutiveDays });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: '登录失败，请稍后重试' });
  }
}

export async function getMe(req: Request, res: Response) {
  const session = req.session as any;
  if (!session.userId) {
    return res.status(401).json({ message: '未登录' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, role: true, avatar: true, createdAt: true, experience: true, level: true, consecutiveDays: true },
    });

    if (!user) {
      (req.session as any).userId = null;
      return res.status(401).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
}

export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: '登出失败' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: '已登出' });
  });
}

export async function changePassword(req: Request, res: Response) {
  const session = req.session as any;
  if (!session.userId) {
    return res.status(401).json({ message: '未登录' });
  }

  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '旧密码和新密码不能为空' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度不能少于6位' });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: '旧密码错误' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: '密码修改成功' });
  } catch (error: any) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ message: '修改密码失败' });
  }
}
