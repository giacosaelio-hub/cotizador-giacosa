import { randomBytes } from "node:crypto";
import type { Response, Request, NextFunction } from "express";

type AdminSession = {
  token: string;
  createdAt: number;
};

const adminSessions: Record<string, AdminSession> = {};

const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * Genera un token seguro de 32 bytes en base64url.
 */
function generateAdminToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Parser simple para cookies a partir de un header crudo de cookies.
 */
function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.split("=");
    const key = name.trim();
    const value = decodeURIComponent(rest.join("=") || "");
    if (key) cookies[key] = value;
  }
  return cookies;
}

/**
 * Extrae el valor de la cookie admin_session del header del request.
 */
function getAdminSessionToken(req: Request): string | undefined {
  if (!req.headers?.cookie) return undefined;
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ADMIN_SESSION_COOKIE];
}

/**
 * Crea una sesión de administrador y setea la cookie en la respuesta.
 */
export function createAdminSession(res: Response): string {
  const token = generateAdminToken();
  const session: AdminSession = { token, createdAt: Date.now() };
  adminSessions[token] = session;

  res.cookie(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });

  return token;
}

/**
 * Limpia la sesión admin, eliminándola de memoria y limpiando la cookie.
 */
export function clearAdminSession(req: Request, res: Response): void {
  const token = getAdminSessionToken(req);
  if (token && adminSessions[token]) {
    delete adminSessions[token];
  }
  res.clearCookie(ADMIN_SESSION_COOKIE, { path: "/" });
}

/**
 * Middleware Express para proteger rutas admin.
 * Requiere sesión admin válida y no expirada.
 */
export function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = getAdminSessionToken(req);

  if (!token || !adminSessions[token]) {
    res.status(401).json({ success: false, message: "No autorizado" });
    return;
  }

  const session = adminSessions[token];
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    delete adminSessions[token];
    res.clearCookie(ADMIN_SESSION_COOKIE, { path: "/" });
    res.status(401).json({ success: false, message: "Sesión expirada" });
    return;
  }

  // Si se desea, se puede refrescar TTL aquí:
  // session.createdAt = Date.now();

  next();
}