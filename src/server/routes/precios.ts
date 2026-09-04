import { Router, type IRouter } from "express";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { requireAdminAuth } from "../lib/adminSession";

const router: IRouter = Router();

const PRECIOS_PATH =
  process.env.PRECIOS_PATH || join(process.cwd(), "precios.json");

function ensurePreciosFile() {
  const fallbackPath = join(process.cwd(), "precios.json");

  if (!existsSync(PRECIOS_PATH)) {
    // Crear desde el archivo bundleado si no existe
    const initialData = readFileSync(fallbackPath, "utf-8");
    mkdirSync(dirname(PRECIOS_PATH), { recursive: true });
    writeFileSync(PRECIOS_PATH, initialData);
    return;
  }

  // Archivo ya existe → migraciones no destructivas sobre el volumen en vivo.
  try {
    const current = JSON.parse(readFileSync(PRECIOS_PATH, "utf-8"));
    const defaults = JSON.parse(readFileSync(fallbackPath, "utf-8"));
    let changed = false;

    // 1) Agregar claves de primer nivel faltantes del bundleado.
    //    'formas_pago_rev' se excluye: lo maneja el paso 3, que necesita ver que
    //    el archivo vivo todavía no tiene la revisión para poder sincronizar.
    const missingKeys = Object.keys(defaults).filter(
      (k) => !(k in current) && k !== "formas_pago_rev",
    );
    if (missingKeys.length > 0) {
      for (const key of missingKeys) {
        current[key] = defaults[key];
      }
      changed = true;
      console.log("[precios] Migración: se agregaron campos faltantes:", missingKeys.join(", "));
    }

    // 2) Asegurar la cuota "1" en sucredito (-15%) y credicash (-10%) si faltan.
    //    Las cuotas casi nunca cambian; esto las inyecta en el volumen en vivo
    //    SOLO si no existen. Si ya están, no se tocan (se respeta lo editado en admin).
    const CUOTA_UNO: Record<string, number> = { sucredito: -15, credicash: -10 };
    if (Array.isArray(current.formas_pago)) {
      for (const tarjeta of current.formas_pago) {
        const id: string = tarjeta?.id;
        if (!Object.prototype.hasOwnProperty.call(CUOTA_UNO, id)) continue;
        if (!Array.isArray(tarjeta.cuotas)) continue;
        const yaExiste = tarjeta.cuotas.some((c: { key?: string }) => c?.key === "1");
        if (!yaExiste) {
          tarjeta.cuotas.unshift({ key: "1", label: "1 cuota", porcentaje: CUOTA_UNO[id], activo: true });
          changed = true;
          console.log(`[precios] Migración: cuota '1' agregada a ${id} (${CUOTA_UNO[id]}%)`);
        }
      }
    }

    // 3) Sincronizar los porcentajes de financiación con la planilla de intereses.
    //    El bundleado sólo siembra el volumen la primera vez, así que sin esto los
    //    porcentajes nuevos nunca llegarían a producción. Se aplica UNA sola vez por
    //    revisión: cuando 'formas_pago_rev' del bundleado difiere del vivo.
    //    Sólo se pisa 'porcentaje' de tarjetas/cuotas que ya existen en ambos lados;
    //    no se agregan, borran ni desactivan planes (se respeta lo editado en admin).
    if (
      defaults.formas_pago_rev &&
      defaults.formas_pago_rev !== current.formas_pago_rev &&
      Array.isArray(current.formas_pago) &&
      Array.isArray(defaults.formas_pago)
    ) {
      type Cuota = { key?: string; porcentaje?: number };
      type Tarjeta = { id?: string; cuotas?: Cuota[] };
      const sincronizados: string[] = [];

      for (const tarjeta of current.formas_pago as Tarjeta[]) {
        const ref = (defaults.formas_pago as Tarjeta[]).find((t) => t.id === tarjeta?.id);
        if (!ref || !Array.isArray(tarjeta?.cuotas) || !Array.isArray(ref.cuotas)) continue;
        for (const cuota of tarjeta.cuotas) {
          const refCuota = ref.cuotas.find((c) => c.key === cuota?.key);
          if (!refCuota || typeof refCuota.porcentaje !== "number") continue;
          if (cuota.porcentaje === refCuota.porcentaje) continue;
          sincronizados.push(`${tarjeta.id}/${cuota.key}: ${cuota.porcentaje}% → ${refCuota.porcentaje}%`);
          cuota.porcentaje = refCuota.porcentaje;
        }
      }

      current.formas_pago_rev = defaults.formas_pago_rev;
      changed = true;
      console.log(
        `[precios] Financiación sincronizada (rev ${defaults.formas_pago_rev}):`,
        sincronizados.length > 0 ? sincronizados.join(", ") : "sin diferencias",
      );
    }

    if (changed) {
      writeFileSync(PRECIOS_PATH, JSON.stringify(current, null, 2));
    }
  } catch (e) {
    // No romper si falla la migración — el archivo existente se usa tal cual
    console.error("[precios] Aviso: no se pudo migrar:", e);
  }
}

// GET /precios es pública (ya no usa requireAdminAuth)
router.get("/precios", (_req, res) => {
  try {
    ensurePreciosFile();

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
    ensurePreciosFile();

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
      // Se conserva para que una edición de admin no dispare de nuevo la
      // sincronización de financiación y pise los porcentajes recién guardados.
      formas_pago_rev: current.formas_pago_rev,
      perfil_c: body.perfil_c ?? current.perfil_c,
      complementarios: body.complementarios ?? current.complementarios,
      hierros: body.hierros ?? current.hierros,
    };

    writeFileSync(PRECIOS_PATH, JSON.stringify(updated, null, 2));
    res.json({ success: true, precios: updated });
  } catch (err) {
    console.error("Error writing precios.json:", err);
    res.status(500).json({ success: false, message: "Error al guardar los precios" });
  }
});

export default router;