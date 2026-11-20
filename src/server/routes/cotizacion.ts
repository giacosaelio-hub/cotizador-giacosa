import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { sendTelegramMessage, sendTelegramPhoto } from "../lib/telegram";
import { analizarTelefono } from "../lib/telefono";
import { createRateLimiter } from "../lib/rateLimit";

interface ProductoCotizado {
  id: string;
  tipo: string;
  descripcion: string;
  medida: string;
  cantidad: number;
  precioUnitarioUSD: number;
  precioUnitarioARS: number;
  subtotalARS: number;
}

interface CotizacionBody {
  numeroCotizacion: string;
  fecha: string;
  nombre: string;
  telefono: string;
  /** Teléfono normalizado para wa.me (ej. 5493815551234), calculado en el servidor. */
  telefonoWhatsApp: string;
  productos: ProductoCotizado[];
  totalARS: number;
  dolar: number;
  formaPago?: string | null;
  importeCuota?: number | null;
  imagenBase64?: string | null;
  gclid?: string | null;
  gclidTimestamp?: string | null;
}

const MAX_PRODUCTOS = 100;
const MAX_IMAGEN_BASE64 = 14 * 1024 * 1024; // ~10 MB de PNG

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

function parseCotizacionBody(raw: unknown): CotizacionBody {
  const b = raw as Record<string, unknown>;
  if (!b || typeof b !== "object") throw new Error("Cuerpo inválido");

  const numeroCotizacion = str(b.numeroCotizacion, 40);
  const fecha = str(b.fecha, 60);
  const nombre = str(b.nombre, 100);
  const telefono = str(b.telefono, 40);
  if (!numeroCotizacion || !fecha || !nombre || !telefono) {
    throw new Error("Faltan campos requeridos");
  }

  // Autenticación del teléfono también en el servidor: el cliente se puede saltear.
  const tel = analizarTelefono(telefono);
  if (!tel.valido) throw new Error("Teléfono inválido");

  if (!Array.isArray(b.productos) || b.productos.length === 0 || b.productos.length > MAX_PRODUCTOS) {
    throw new Error("Productos inválidos");
  }
  const productos: ProductoCotizado[] = b.productos.map((p: any) => ({
    id: str(p?.id, 80),
    tipo: str(p?.tipo, 40),
    descripcion: str(p?.descripcion, 200),
    medida: str(p?.medida, 100),
    cantidad: num(p?.cantidad),
    precioUnitarioUSD: num(p?.precioUnitarioUSD),
    precioUnitarioARS: num(p?.precioUnitarioARS),
    subtotalARS: num(p?.subtotalARS),
  }));

  let imagenBase64: string | null = null;
  if (typeof b.imagenBase64 === "string" && b.imagenBase64.length > 0) {
    if (b.imagenBase64.length > MAX_IMAGEN_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(b.imagenBase64)) {
      throw new Error("Imagen inválida");
    }
    imagenBase64 = b.imagenBase64;
  }

  return {
    numeroCotizacion,
    fecha,
    nombre,
    telefono,
    telefonoWhatsApp: tel.whatsapp,
    productos,
    totalARS: num(b.totalARS),
    dolar: num(b.dolar),
    formaPago: str(b.formaPago, 120) || null,
    importeCuota: typeof b.importeCuota === "number" && Number.isFinite(b.importeCuota) ? b.importeCuota : null,
    imagenBase64,
    gclid: str(b.gclid, 200) || null,
    gclidTimestamp: str(b.gclidTimestamp, 60) || null,
  };
}

const router: IRouter = Router();

// El envío dispara Telegram + n8n: se limita para que no se use como spammer.
const limitarEnvio = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Demasiadas cotizaciones desde tu conexión. Probá de nuevo en unos minutos.",
});
const limitarNumero = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: "Demasiadas solicitudes. Probá de nuevo en unos minutos.",
});

const N8N_WEBHOOK_URL =
  process.env["N8N_WEBHOOK_URL"] ||
  "https://cotizadorgiacosa-n8n.e6tqu7.easypanel.host/webhook/cotizacion";

const TELEGRAM_CHAT_ID = process.env["TELEGRAM_CHAT_ID"];

const COUNTER_FILE = 
  process.env.COUNTER_FILE || path.join(process.cwd(), "data/counter.json");

function getNextCotizacionNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const today = `${yy}${mm}${dd}`;

  let data: { date: string; counter: number } = { date: "", counter: 0 };
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      data = JSON.parse(fs.readFileSync(COUNTER_FILE, "utf8"));
    }
  } catch {}

  if (data.date !== today) {
    data = { date: today, counter: 0 };
  }
  data.counter++;

  try {
    const dir = path.dirname(COUNTER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(COUNTER_FILE, JSON.stringify(data));
  } catch (e) {
    console.error("Error writing counter file:", e);
  }

  return `COT-${today}-${String(data.counter).padStart(3, "0")}`;
}

function buildCaption(body: CotizacionBody): string {
  const { numeroCotizacion, fecha, nombre, telefono, productos, totalARS, formaPago, importeCuota } = body;

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(n);

  const subtotal = productos.reduce((sum, p) => sum + p.subtotalARS, 0);
  const diferencia = subtotal - totalARS;

  let pagoTipo = "";
  let pagoCuotas = "";
  if (formaPago) {
    const parts = formaPago.split(" \u2013 ");
    pagoTipo = parts[0]?.trim() ?? "";
    pagoCuotas = parts[1]?.trim() ?? "";
  }
  const esEfectivo = pagoTipo.toLowerCase().startsWith("efectivo");
  const esTransferencia = pagoTipo.toLowerCase().startsWith("transferencia");

  const numCuotas =
    importeCuota && importeCuota > 0 && totalARS > 0
      ? Math.round(totalARS / importeCuota)
      : 0;

  const lines = [
    `Nueva Cotización: ${numeroCotizacion}`,
    `Fecha: ${fecha}`,
    ``,
    `Cliente: ${nombre}`,
    `Tel: ${telefono}`,
    `WhatsApp: https://wa.me/${body.telefonoWhatsApp}`,
    ``,
    `Productos:`,
    ...productos.map((p) => `• ${p.descripcion} | ${p.medida} | x${p.cantidad} | ${fmt(p.subtotalARS)}`),
    ``,
  ];

  // SIEMPRE mostrar subtotal
lines.push(`SUBTOTAL: ${fmt(subtotal)}`);

// Mostrar descuento o recargo SOLO si existe
if (Math.abs(diferencia) > 0) {
  if (diferencia > 0) {
    lines.push(`DESCUENTO (${pagoTipo || "Descuento"}): -${fmt(diferencia)}`);
  } else {
    lines.push(`RECARGO (${pagoTipo || "Recargo"}): +${fmt(Math.abs(diferencia))}`);
  }
}

// SIEMPRE mostrar total final
lines.push(`TOTAL FINAL: ${fmt(totalARS)}`);

  if (pagoTipo) {
    lines.push(``, `FORMA DE PAGO: ${pagoTipo}`);
    if (!esEfectivo && !esTransferencia && numCuotas > 1 && importeCuota && importeCuota > 0) {
      lines.push(`CUOTAS: ${numCuotas}`, `VALOR POR CUOTA: ${fmt(importeCuota)}`);
    } else if (!esEfectivo && !esTransferencia && pagoCuotas && pagoCuotas.toLowerCase() !== "1 cuota") {
      lines.push(`PLAN: ${pagoCuotas}`);
    }
  }

  return lines.join("\n");
}

async function enviarATelegram(body: CotizacionBody): Promise<void> {
  if (!TELEGRAM_CHAT_ID) {
    throw new Error("TELEGRAM_CHAT_ID no configurado");
  }

  console.log("Cotización recibida:", body.numeroCotizacion);
  console.log("Generando texto...");
  const caption = buildCaption(body);
  const chatId = TELEGRAM_CHAT_ID;

  console.log(`[Telegram] chat_id: ${chatId} | imagen: ${body.imagenBase64 ? "sí" : "no"}`);
  console.log("Enviando a Telegram...");

    if (body.imagenBase64) {
    console.log("Generando imagen...");
    await sendTelegramPhoto(chatId, body.imagenBase64, caption, `${body.numeroCotizacion}.png`);
  } else {
    await sendTelegramMessage(chatId, caption);
  }

  // Webhook de n8n: es secundario. Si falla o tarda, la cotización ya llegó a
  // Telegram, así que no se propaga el error (antes devolvía 500 igual).
  try {
    const r = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        texto: caption,
        numeroCotizacion: body.numeroCotizacion,
        fecha: body.fecha,
        nombre: body.nombre,
        telefono: body.telefono,
        telefonoWhatsApp: body.telefonoWhatsApp,
        totalARS: body.totalARS,
        formaPago: body.formaPago ?? "",
        importeCuota: body.importeCuota ?? "",
        gclid: body.gclid ?? "",
        gclidTimestamp: body.gclidTimestamp ?? "",
        productos: body.productos,
      }),
    });
    if (!r.ok) console.error(`[n8n] webhook respondió ${r.status}`);
  } catch (e: any) {
    console.error("[n8n] webhook falló:", e?.message ?? e);
  }

  console.log("Enviado correctamente");
}

router.get("/cotizacion/numero", limitarNumero, (_req, res) => {
  const numero = getNextCotizacionNumber();
  return res.json({ numero });
});

async function manejarEnvio(req: import("express").Request, res: import("express").Response) {
  let body: CotizacionBody;
  try {
    body = parseCotizacionBody(req.body);
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err?.message ?? "Datos inválidos" });
  }

  try {
    await enviarATelegram(body);
    return res.json({ success: true, message: "Cotización enviada a Telegram", numeroCotizacion: body.numeroCotizacion });
  } catch (err: any) {
    console.error("Error:", err?.message ?? err);
    return res.status(500).json({ success: false, message: "Error al enviar la cotización a Telegram" });
  }
}

router.post("/cotizacion/enviar", limitarEnvio, manejarEnvio);
// Alias legado: se mantiene por compatibilidad con integraciones viejas.
router.post("/send-quote", limitarEnvio, manejarEnvio);

export default router;
