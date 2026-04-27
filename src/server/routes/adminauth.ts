import { Router } from "express";
import { createAdminSession, clearAdminSession, requireAdminAuth } from "../lib/adminSession";

const router = Router();

router.post("/admin/login", (req, res) => {
  const { password } = req.body || {};

  if (!password || typeof password !== "string") {
    return res.status(400).json({ success: false, message: "Contraseña requerida" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ success: false, message: "ADMIN_PASSWORD no configurada" });
  }

  if (password !== adminPassword) {
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