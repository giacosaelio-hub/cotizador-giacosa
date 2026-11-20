import { Router } from "express";
import { timingSafeEqual, createHash } from "node:crypto";
import { createAdminSession, clearAdminSession, requireAdminAuth } from "../lib/adminSession";
import { createRateLimiter } from "../lib/rateLimit";

const router = Router();

// Freno a la fuerza bruta: 8 intentos cada 15 minutos por IP.
const limitarLogin = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: "Demasiados intentos. Esperá unos minutos antes de volver a probar.",
});

// Comparación en tiempo constante (se hashea para igualar largos).
function passwordsIguales(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

router.post("/admin/login", limitarLogin, (req, res) => {
  const { password } = req.body || {};

  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, message: "Contraseña requerida" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ success: false, message: "ADMIN_PASSWORD no configurada" });
  }

  if (!passwordsIguales(password, adminPassword)) {
    return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
  }

  createAdminSession(res);
  return res.json({ success: true });
});

router.post("/admin/logout", (req, res) => {
  clearAdminSession(req, res);
  return res.json({ success: true });
});

router.get("/admin/me", requireAdminAuth, (req, res) => {
  return res.json({ success: true, authenticated: true });
});

export default router;
