import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session.userId) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session.userId) {
    return res.status(401).json({ message: '未登录，请先登录' });
  }
  if (session.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
}
