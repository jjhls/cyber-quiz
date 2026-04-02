import type { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { param } from '../utils/helpers';

export async function getUsers(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, role: true, createdAt: true, updatedAt: true },
      }),
      prisma.user.count(),
    ]);

    res.json({ data: users, total, page, pageSize });
  } catch (error: any) {
    console.error('GetUsers error:', error);
    res.status(500).json({ message: '获取用户列表失败' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = param(req.params, 'id');
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: '无效的角色值' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    res.json(user);
  } catch (error: any) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ message: '更新用户失败' });
  }
}
