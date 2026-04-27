import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";
import { sendTelegramMessage, sendTelegramPhoto } from "../lib/telegram";

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
  productos: ProductoCotizado[];
  totalARS: number;
  dolar: number;
  formaPago?: string | null;
  importeCuota?: number | null;
  imagenBase64?: string | null;
  gclid?: string | null;
  gclidTimestamp?: string | null;
}

function parseCotizacionBody(raw: unknown): CotizacionBody {
  const b = raw as Record<string, unknown>;
  if (!b || typeof b !== "object") throw new Error("Cuerpo inválido");
  if (!b.numeroCotizacion || !b.fecha || !b.nombre || !b.telefono) {
    throw new Error("Faltan campos requeridos");
  }
  return b as unknown as CotizacionBody;
}

const router: IRouter = Router();

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

  // 🔥 ENVIAR A N8N (WEBHOOK)
  await fetch("https://cotizadorgiacosa-n8n.e6tqu7.easypanel.host/webhook/cotizacion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      texto: caption,
      numeroCotizacion: body.numeroCotizacion,
      fecha: body.fecha,
      nombre: body.nombre,
      telefono: body.telefono,
      totalARS: body.totalARS,
      formaPago: body.formaPago ?? "",
      importeCuota: body.importeCuota ?? "",
      gclid: body.gclid ?? "",
      gclidTimestamp: body.gclidTimestamp ?? "",
      productos: body.productos
    })
  });

  console.log("Enviado correctamente");
}

router.get("/cotizacion/numero", (_req, res) => {
  const numero = getNextCotizacionNumber();
  return res.json({ numero });
});

router.post("/cotizacion/enviar", async (req, res) => {
  console.log("Request recibida:", JSON.stringify(req.body).slice(0, 200));
  try {
    const body = parseCotizacionBody(req.body);
    await enviarATelegram(body);
    return res.json({ success: true, message: "Cotización enviada a Telegram", numeroCotizacion: body.numeroCotizacion });
  } catch (err: any) {
    console.error("Error:", err?.message ?? err);
    return res.status(500).json({ success: false, message: "Error al enviar la cotización a Telegram" });
  }
});

router.post("/send-quote", async (req, res) => {
  console.log("Request recibida:", JSON.stringify(req.body).slice(0, 200));
  try {
    const body = parseCotizacionBody(req.body);
    await enviarATelegram(body);
    return res.json({ success: true, message: "Cotización enviada a Telegram", numeroCotizacion: body.numeroCotizacion });
  } catch (err: any) {
    console.error("Error:", err?.message ?? err);
    return res.status(500).json({ success: false, message: "Error al enviar la cotización a Telegram" });
  }
});

export default router;
