import { Router, type IRouter } from "express";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const router: IRouter = Router();

const PRECIOS_PATH = join(process.cwd(), "precios.json");

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

router.post("/precios", (req, res): void => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object") {
      res.status(400).json({ success: false, message: "Cuerpo inválido" });
      return;
    }
    const current = JSON.parse(readFileSync(PRECIOS_PATH, "utf-8"));
    const updated: Record<string, unknown> = {
      dolar: Number(body.dolar) || current.dolar,
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
