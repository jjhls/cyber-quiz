import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const loginAttempts = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

function getKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const key = getKey(req);
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count++;

  if (entry.count > MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      message: `请求过于频繁，请 ${Math.ceil(retryAfter / 60)} 分钟后重试`,
      retryAfter,
    });
  }

  next();
}
