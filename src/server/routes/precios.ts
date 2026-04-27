import { Router, type IRouter } from "express";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { requireAdminAuth } from "../lib/adminSession";

const router: IRouter = Router();

const PRECIOS_PATH = process.env.PRECIOS_PATH || join(process.cwd(), "precios.json");

// GET /precios es pública (ya no usa requireAdminAuth)
router.get("/precios", (_req, res) => {
  try {
    const raw = readFileSync(PRECIOS_PATH, "utf-8");
    const precios = JSON.parse(raw);
    res.json(precios);
  } catch (err) {
    console.error("Error reading precios.json:", err);
    res.status(500).json({ success: false, message: "Error al leer los precios" });
  }
});

// POST /precios sólo admin (mantiene protección requireAdminAuth)
router.post("/precios", requireAdminAuth, (req, res): void => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).json({ success: false, message: "Cuerpo inválido" });
      return;
    }
    const current = JSON.parse(readFileSync(PRECIOS_PATH, "utf-8"));

    // Asegurarse que el valor para dólar acepte 0 como válido y rechace NaN y strings vacíos
    let dolarActualizado: unknown = body.dolar;
    let dolar: number | undefined;
    if (typeof dolarActualizado === "number") {
      dolar = !isNaN(dolarActualizado) ? dolarActualizado : undefined;
    } else if (
      typeof dolarActualizado === "string" &&
      dolarActualizado.trim() !== "" &&
      !isNaN(Number(dolarActualizado))
    ) {
      dolar = Number(dolarActualizado);
    } else {
      dolar = undefined;
    }

    const updated: Record<string, unknown> = {
      dolar: typeof dolar === "number" && !isNaN(dolar) ? dolar : current.dolar,
      chapas_perfiladas: body.chapas_perfiladas ?? current.chapas_perfiladas,
      bobinas: body.bobinas ?? current.bobinas,
      bobinas_variantes: body.bobinas_variantes ?? current.bobinas_variantes,
      chapas_estandar: body.chapas_estandar ?? current.chapas_estandar,
      formas_pago: body.formas_pago ?? current.formas_pago,
    };
    writeFileSync(PRECIOS_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, precios: updated });
  } catch (err) {
    console.error("Error writing precios.json:", err);
    res.status(500).json({ success: false, message: "Error al guardar los precios" });
  }
});

export default router;
