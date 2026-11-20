import type { Request, Response, NextFunction } from "express";

/**
 * Rate limiter en memoria (por IP). Suficiente para una sola instancia en
 * EasyPanel; si algún día hay varias réplicas conviene pasarlo a Redis.
 * Requiere `app.set("trust proxy", 1)` para ver la IP real detrás del proxy.
 */
export function createRateLimiter(opts: { windowMs: number; max: number; message: string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Limpieza periódica para que el Map no crezca sin límite.
  setInterval(() => {
    const now = Date.now();
    for (const [key, v] of hits) if (v.resetAt <= now) hits.delete(key);
  }, 5 * 60 * 1000).unref();

  return function rateLimit(req: Request, res: Response, next: NextFunction): void {
    const key = req.ip || "unknown";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + opts.windowMs });
      next();
      return;
    }

    entry.count++;
    if (entry.count > opts.max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).json({ success: false, message: opts.message });
      return;
    }
    next();
  };
}
