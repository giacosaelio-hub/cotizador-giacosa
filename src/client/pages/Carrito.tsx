import { useRef, useState } from "react";
import {
  CartItem,
  Precios,
  TarjetaOpcion,
  CuotaOpcion,
  formatARS,
  formatFecha,
} from "@/lib/precios";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Download,
  Lock,
  MessageCircle,
  Minus,
  Plus,
  Send,
  ShoppingCart,
  Trash2,
  Wallet,
} from "lucide-react";
import { toPng } from "html-to-image";

interface Props {
  cart: CartItem[];
  precios: Precios;
  onUpdateCantidad: (id: string, cantidad: number) => void;
  onRemove: (id: string) => void;
  onAgregarMas: () => void;
  onClearCart: () => void;
}

function isValidNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function getSafePrecio(n: unknown): number {
  return isValidNumber(n) ? n : 0;
}

function safeFormatARS(n: unknown): string {
  return isValidNumber(n) ? formatARS(n) : "—";
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function cuotaNumero(cuota: CuotaOpcion | null): number {
  if (!cuota || cuota.key === "zeta") return 0;
  const parsed = parseInt(cuota.key, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizePaymentKey(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function paymentDisplayKey(label: string): string {
  const key = normalizePaymentKey(label);
  if (key.includes("visa") && key.includes("master")) return "visa-mastercard";
  if (key.includes("debito")) return "debito";
  if (key.includes("naranja")) return "naranjax";
  if (key.includes("cabal")) return "cabal";
  if (key.includes("titanio")) return "titanio";
  if (key.includes("cencosud")) return "cencosud";
  if (key === "sol" || key.includes("tarjetasol")) return "sol";
  if (key.includes("credicash")) return "credicash";
  if (key.includes("sucredito")) return "sucredito";
  if (key.includes("american") || key.includes("amex")) return "amex";
  if (key.includes("master")) return "mastercard";
  if (key.includes("visa")) return "visa";
  return key;
}

function paymentLogoPath(label: string): string | null {
  const key = paymentDisplayKey(label);

  if (key === "visa-mastercard") return null;
  if (key === "debito") return null;
  if (key === "naranjax") return "/images/pagos/naranja.png";
  if (key === "cabal") return "/images/pagos/cabal.png";
  if (key === "titanio") return "/images/pagos/titanio.png";
  if (key === "cencosud") return "/images/pagos/cencosud.png";
  if (key === "sol") return "/images/pagos/sol.png";
  if (key === "credicash") return "/images/pagos/credicash.png";
  if (key === "sucredito") return "/images/pagos/sucredito.png";
  if (key === "amex") return "/images/pagos/amex.png";
  if (key === "mastercard") return "/images/pagos/mastercard.png";
  if (key === "visa") return "/images/pagos/visa.png";
  return null;
}
function PaymentBrandContent({ label }: { label: string }) {
  const key = paymentDisplayKey(label);
  const logo = paymentLogoPath(label);

  if (key === "visa-mastercard") {
    return (
      <div className="flex items-center justify-center gap-4">
        <img
          src="/images/pagos/visa.png"
          alt="Visa"
          className="h-9 max-w-[92px] object-contain"
        />
        <img
          src="/images/pagos/mastercard.png"
          alt="Mastercard"
          className="h-9 max-w-[92px] object-contain"
        />
      </div>
    );
  }

  if (logo) {
    return (
      <img
        src={logo}
        alt={label}
        className="max-h-12 max-w-[150px] object-contain"
      />
    );
  }

  return <span className="text-base font-black text-slate-800">{label}</span>;
}

function dedupePaymentOptions(options: TarjetaOpcion[]): TarjetaOpcion[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    const key = paymentDisplayKey(option.label);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ResumenLinea({ label, value, danger = false, strong = false }: { label: string; value: string; danger?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className={`${strong ? "font-black text-slate-950" : "font-bold text-slate-700"} ${danger ? "text-red-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function StepBadge({ number, title, subtitle, active = true }: { number: number; title: string; subtitle: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${active ? "opacity-100" : "opacity-60"}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-base font-black text-white shadow-sm">
        {number}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-slate-950">{title}</div>
        <div className="text-xs font-semibold text-slate-500">{subtitle}</div>
      </div>
    </div>
  );
}

export default function Carrito({
  cart,
  precios,
  onUpdateCantidad,
  onRemove,
  onAgregarMas,
  onClearCart,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [medioPago, setMedioPago] = useState<"" | "efectivo" | "tarjeta">("");
  const [tarjetaId, setTarjetaId] = useState("");
  const [cuotaKey, setCuotaKey] = useState("");
  const [docNumero, setDocNumero] = useState("");
  const [preview, setPreview] = useState<{ pngDataUrl: string; numero: string } | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const fecha = formatFecha(new Date());
  const totalBase = cart.reduce((sum, item) => sum + getSafePrecio(item?.subtotalARS), 0);
  const formasPago: TarjetaOpcion[] = precios.formas_pago ?? [];
  const formasPagoVisibles: TarjetaOpcion[] = dedupePaymentOptions(
    formasPago.filter((opcion) => paymentDisplayKey(opcion.label) !== "debito")
  );
  const tarjetaSeleccionada: TarjetaOpcion | null = formasPago.find((t) => t.id === tarjetaId) ?? null;
  const cuotasDisponibles: CuotaOpcion[] = (tarjetaSeleccionada?.cuotas ?? []).filter((c) => c.activo);
  const cuotaSeleccionada: CuotaOpcion | null = cuotasDisponibles.find((c) => c.key === cuotaKey) ?? null;

  const porcentaje =
    medioPago === "efectivo"
      ? -20
      : medioPago === "tarjeta" && cuotaSeleccionada
        ? cuotaSeleccionada.porcentaje
        : 0;
  const totalFinal = totalBase * (1 + porcentaje / 100);
  const ajuste = totalFinal - totalBase;
  const numCuotas = cuotaNumero(cuotaSeleccionada);
  const importeCuota = numCuotas > 1 ? totalFinal / numCuotas : null;

  const formaPagoLabel =
    medioPago === "efectivo"
      ? "Efectivo / Transferencia"
      : tarjetaSeleccionada && cuotaSeleccionada
        ? `${tarjetaSeleccionada.label} - ${cuotaSeleccionada.label}`
        : "";

  const nombreValido = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(nombre.trim()) && nombre.trim().length >= 2;
  const telefonoValido = onlyDigits(telefono).length >= 7;
  const hasPayment = medioPago === "efectivo" || (medioPago === "tarjeta" && tarjetaId !== "" && cuotaKey !== "");
  const canGenerar = cart.length > 0 && nombreValido && telefonoValido && hasPayment;

  function scrollToCotizadorCategorias() {
    sessionStorage.setItem("scrollToCotizadorCategorias", "1");
    onAgregarMas();

    const tryScroll = (attempt = 0) => {
      const target = document.getElementById("cotizador-categorias");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        sessionStorage.removeItem("scrollToCotizadorCategorias");
        return;
      }

      if (attempt < 8) {
        window.setTimeout(() => tryScroll(attempt + 1), 120);
      }
    };

    window.setTimeout(() => tryScroll(), 120);
  }

  async function handleGenerar(event?: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();
    event?.stopPropagation();
  
    if (!canGenerar) return;
    setLoading(true);
    setErrorMsg("");
    setPreview(null);

    let numero = "";
    try {
      const r = await fetch("/api/cotizacion/numero");
      const data = await r.json();
      numero = data.numero;
    } catch {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      numero = `COT-${yy}${mm}${dd}-${String(Math.floor(Math.random() * 900) + 100)}`;
    }

    setDocNumero(numero);
    await new Promise((r) => setTimeout(r, 500));

    let pngDataUrl = "";
    try {
      const el = docRef.current;
      if (!el) throw new Error("No se encontró el documento de cotización");
      pngDataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#f6f8f7",
        width: 920,
        canvasWidth: 920,
      });
    } catch (imgErr) {
      console.error("Error generando imagen:", imgErr);
      setErrorMsg("No se pudo generar la imagen. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    try {
      const base64 = pngDataUrl.split(",")[1] ?? "";
      await fetch("/api/cotizacion/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroCotizacion: numero,
          fecha,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          productos: cart.map((item) => ({
            id: item.id,
            tipo: item.tipo,
            descripcion: item.descripcion,
            medida: item.medida,
            cantidad: item.cantidad,
            precioUnitarioUSD: item.precioUnitarioUSD,
            precioUnitarioARS: getSafePrecio(item.precioUnitarioARS),
            subtotalARS: getSafePrecio(item.subtotalARS),
          })),
          totalARS: totalFinal,
          dolar: precios.dolar,
          formaPago: formaPagoLabel || undefined,
          importeCuota: importeCuota ?? undefined,
          imagenBase64: base64,
          gclid: localStorage.getItem("gclid") || "",
          gclidTimestamp: localStorage.getItem("gclid_timestamp") || "",
        }),
      });
    } catch {
      // Si falla el envío, igual mostramos la cotización generada para no perder al cliente.
    }

    setPreview({ pngDataUrl, numero });
    setLoading(false);
    
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  }

  function handleDescargar() {
    if (!preview) return;
    const link = document.createElement("a");
    link.download = `${preview.numero}.png`;
    link.href = preview.pngDataUrl;
    link.click();
  }

  function handleWhatsApp() {
    const num = preview?.numero || "la cotización";
    const pagoStr = formaPagoLabel ? ` Forma de pago: ${formaPagoLabel}.` : "";
    const text = encodeURIComponent(`Hola, quiero confirmar la cotización ${num}.${pagoStr} ¿Hay stock disponible?`);
    window.open(`https://wa.me/5493815589875?text=${text}`, "_blank");
  }

  function handleNuevaCotizacion() {
    setPreview(null);
    setNombre("");
    setTelefono("");
    setMedioPago("");
    setTarjetaId("");
    setCuotaKey("");
    onClearCart();
    onAgregarMas();
  }

  if (cart.length === 0 && !preview) {
    return (
      <div className="min-h-[70vh] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7faf9_100%)] px-4 py-10">
        <div className="mx-auto max-w-[760px] overflow-hidden rounded-[30px] border border-emerald-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
          <div className="border-b border-emerald-100 bg-emerald-50/70 px-6 py-5 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-700">Cotización</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">Todavía no agregaste productos</h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-600">
              Elegí chapas, bobinas o productos estándar para armar tu pedido y ver el total actualizado.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <ShoppingCart className="h-7 w-7" />
            </div>
            <div>
              <p className="text-base font-black text-slate-950">Empezá por seleccionar un producto</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Vas a poder agregar más de un material antes de confirmar.</p>
            </div>
            <button
              type="button"
              onClick={scrollToCotizadorCategorias}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Elegir productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pagoResumen = medioPago === "efectivo" ? "20% OFF aplicado" : medioPago === "tarjeta" && cuotaSeleccionada ? cuotaSeleccionada.label : "Pendiente";
  if (preview) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7faf9_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={scrollToCotizadorCategorias}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a productos
            </button>

            <div className="hidden rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm sm:block">
              {preview.numero}
            </div>
          </div>

          <section className="overflow-hidden rounded-[34px] border border-emerald-100 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.10)]">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-5 py-8 text-center sm:px-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                <CheckCircle className="h-9 w-9" />
              </div>

              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.32em] text-emerald-700">
                Cotización generada
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Cotización lista
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                Ya generamos tu cotización. Podés descargarla y confirmarla por WhatsApp.
              </p>

              <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Número</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{preview.numero}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Forma de pago</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{formaPagoLabel || "—"}</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-700 px-4 py-3 text-left text-white shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-100">Total final</p>
                  <p className="mt-1 text-xl font-black">{safeFormatARS(totalFinal)}</p>
                </div>
              </div>
            </div>

            <div className="px-4 py-7 sm:px-8 lg:px-10">
              <div className="mx-auto max-w-[940px] overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50 p-3 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
                <img
                  src={preview.pngDataUrl}
                  alt="Vista previa de la cotización"
                  className="mx-auto block w-full rounded-2xl bg-white object-contain"
                />
              </div>

              <div className="mx-auto mt-7 grid max-w-[940px] gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-6 py-5 text-base font-black text-white shadow-lg shadow-green-900/15 transition hover:brightness-95 active:scale-[0.98]"
                >
                  <MessageCircle className="h-6 w-6" />
                  Confirmar por WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleDescargar}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-base font-black text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  <Download className="h-6 w-6" />
                  Descargar cotización
                </button>
              </div>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={handleNuevaCotizacion}
                  className="rounded-full px-5 py-3 text-sm font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  Crear nueva cotización
                </button>
              </div>

              <div className="mx-auto mt-5 flex max-w-[940px] items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center text-xs font-bold text-emerald-800">
                <Lock className="h-4 w-4" />
                Revisá el detalle antes de confirmar por WhatsApp. La disponibilidad de stock se confirma con el vendedor.
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7faf9_100%)]">
      <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-start">
          <button
            onClick={onAgregarMas}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> Inicio
          </button>
        </div>

        <section className="mb-5 rounded-[24px] border border-emerald-100 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-700">Checkout de cotización</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-[28px]">Confirmá tu cotización</h1>
              <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                Revisá productos, elegí forma de pago y dejanos tus datos para enviarla al vendedor.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[620px]">
              <StepBadge number={1} title="Mi cotización" subtitle={`${cart.length} producto${cart.length === 1 ? "" : "s"}`} />
              <StepBadge number={2} title="Forma de pago" subtitle={pagoResumen} active={hasPayment} />
              <StepBadge number={3} title="Confirmación" subtitle="Nombre y teléfono" active={nombre.trim() !== "" && telefonoValido} />
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
          <main className="space-y-5">
            <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">1</span>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">Revisá tus productos</h2>
                      <p className="text-sm font-medium text-slate-500">Podés cambiar cantidades, quitar productos o sumar otro antes de confirmar.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden grid-cols-[1fr_160px_112px_128px_128px_44px] border-b border-slate-100 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-400 md:grid">
                <div>Producto</div>
                <div>Medida</div>
                <div className="text-center">Cant.</div>
                <div className="text-right">Precio u.</div>
                <div className="text-right">Subtotal</div>
                <div />
              </div>

              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_160px_112px_128px_128px_44px] md:items-center">
                    <div>
                      <div className="text-base font-black leading-snug text-slate-950">{item.descripcion}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-400 md:hidden">{item.medida}</div>
                    </div>
                    <div className="text-sm font-semibold text-slate-500 max-md:hidden">{item.medida}</div>
                    <div className="flex items-center gap-2 md:justify-center">
                      <button
                        type="button"
                        onClick={() => onUpdateCantidad(item.id, Math.max(1, item.cantidad - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-base font-black text-emerald-700">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateCantidad(item.id, Math.min(300, item.cantidad + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-slate-500 md:text-right">{safeFormatARS(item.precioUnitarioARS)}</div>
                    <div className="text-base font-black text-slate-950 md:text-right">{safeFormatARS(item.subtotalARS)}</div>
                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-emerald-100 bg-emerald-50/55 px-5 py-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-950">¿Querés sumar otro producto?</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Podés agregar más materiales antes de elegir la forma de pago.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={scrollToCotizadorCategorias}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-5 py-3 text-sm font-black text-emerald-800 shadow-sm transition hover:bg-emerald-50 hover:shadow-md active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" /> Agregar producto
                  </button>
                </div>
              </div>
            </section>

            <section id="forma-pago" className="scroll-mt-24 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">2</span>
                <div>
                  <h2 className="text-lg font-black text-slate-950">Elegí cómo querés pagar</h2>
                  <p className="text-sm font-medium text-slate-500">El total se actualiza según el método elegido.</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setMedioPago("efectivo");
                    setTarjetaId("");
                    setCuotaKey("");
                  }}
                  className={`relative rounded-3xl border p-5 text-left transition ${
                    medioPago === "efectivo"
                      ? "border-emerald-400 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-200"
                  }`}
                >
                  {medioPago === "efectivo" && <CheckCircle className="absolute right-4 top-4 h-5 w-5 text-emerald-700" />}
                  <Wallet className="mb-3 h-8 w-8 text-emerald-700" />
                  <div className="text-base font-black text-slate-950">Efectivo / Transferencia</div>
                  <div className="mt-1 text-2xl font-black text-emerald-700">20% OFF</div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">Se aplica al total final.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMedioPago("tarjeta")}
                  className={`relative rounded-3xl border p-5 text-left transition ${
                    medioPago === "tarjeta"
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {medioPago === "tarjeta" && <CheckCircle className="absolute right-4 top-4 h-5 w-5 text-slate-900" />}
                  <CreditCard className="mb-3 h-8 w-8 text-blue-700" />
                  <div className="text-base font-black text-slate-950">Tarjeta</div>
                  <div className="mt-1 text-2xl font-black text-slate-950">Cuotas</div>
                  <div className="mt-1 text-sm font-semibold text-slate-500">Elegí tarjeta y financiación.</div>
                </button>
              </div>

              {medioPago === "tarjeta" && (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="mb-3 text-sm font-black text-slate-800">Seleccioná la tarjeta</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                     {formasPagoVisibles.map((t) => {
                        const selected = tarjetaId === t.id;
                          return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setTarjetaId(t.id);
                              setCuotaKey("");
                            }}
                            className={`relative flex min-h-[82px] items-center justify-center rounded-2xl border bg-white px-4 py-3 text-center transition ${
                              selected ? "border-emerald-400 ring-4 ring-emerald-100" : "border-slate-200 hover:border-emerald-200"
                            }`}
                          >
                            {selected && <CheckCircle className="absolute right-2 top-2 h-4 w-4 text-emerald-700" />}
                            <PaymentBrandContent label={t.label} />
                            
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {tarjetaSeleccionada && cuotasDisponibles.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-black text-slate-800">Elegí las cuotas</p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {cuotasDisponibles.map((c) => {
                          const selected = cuotaKey === c.key;
                          return (
                            <button
                              key={c.key}
                              type="button"
                              onClick={() => setCuotaKey(c.key)}
                              className={`rounded-2xl border px-4 py-3 text-left transition ${
                                selected ? "border-emerald-400 bg-emerald-50 ring-4 ring-emerald-100" : "border-slate-200 bg-white hover:border-emerald-200"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-black text-slate-950">{c.label}</span>
                                {selected && <CheckCircle className="h-4 w-4 text-emerald-700" />}
                              </div>
                              <div className={`mt-1 text-xs font-black ${c.porcentaje < 0 ? "text-emerald-700" : c.porcentaje > 0 ? "text-amber-700" : "text-slate-500"}`}>
                                {c.porcentaje < 0
                                  ? `${Math.abs(c.porcentaje)}% descuento`
                                  : c.porcentaje > 0
                                    ? `+${c.porcentaje}% recargo`
                                    : "Sin recargo"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">3</span>
                <div>
                  <h2 className="text-lg font-black text-slate-950">Tus datos</h2>
                  <p className="text-sm font-medium text-slate-500">Solo necesitamos nombre y teléfono para confirmar.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-800">Nombre completo</span>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-800">Teléfono</span>
                  <input
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 381 555 1234"
                    inputMode="tel"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
              </div>
            </section>
          </main>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
              <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">Resumen final</p>
                <p className="mt-1 text-sm font-bold text-slate-600">Tu total antes de confirmar</p>
              </div>

              <div className="space-y-4 p-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <ResumenLinea label="Subtotal" value={safeFormatARS(totalBase)} />
                  {medioPago === "efectivo" && <ResumenLinea label="Descuento efectivo" value={`- ${safeFormatARS(Math.abs(ajuste))}`} danger />}
                  {medioPago === "tarjeta" && cuotaSeleccionada && porcentaje !== 0 && (
                    <ResumenLinea
                      label={porcentaje > 0 ? "Recargo financiación" : "Descuento tarjeta"}
                      value={`${porcentaje > 0 ? "+ " : "- "}${safeFormatARS(Math.abs(ajuste))}`}
                      danger={porcentaje < 0}
                    />
                  )}
                  <div className="my-3 border-t border-slate-200" />
                  <ResumenLinea label="Forma de pago" value={formaPagoLabel || "Pendiente"} strong />
                  {importeCuota && <ResumenLinea label="Valor por cuota" value={`${numCuotas} x ${safeFormatARS(importeCuota)}`} strong />}
                </div>

                <div className="rounded-3xl bg-emerald-700 p-5 text-white shadow-lg shadow-emerald-900/15">
                  <div className="text-sm font-black uppercase tracking-wide text-emerald-100">Total final</div>
                  <div className="mt-1 text-4xl font-black tracking-tight">{safeFormatARS(totalFinal)}</div>
                </div>

                {errorMsg && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMsg}</div>}

                <button
                  type="button"
                  onClick={handleGenerar}
                  disabled={loading || !canGenerar}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-base font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Generando...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" /> Confirmar cotización
                    </>
                  )}
                </button>

                {!canGenerar && !loading && (
                  <p className="text-center text-xs font-bold text-slate-400">
                    {!hasPayment
                      ? "Elegí una forma de pago para continuar."
                      : !nombreValido
                        ? "Ingresá un nombre válido para continuar."
                        : "Completá un teléfono válido para continuar."}
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                  <Lock className="h-4 w-4" /> Tu cotización queda registrada y segura.
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>     
       <div style={{ position: "absolute", top: 0, left: "-9999px", overflow: "hidden" }}>
        <div
          ref={docRef}
          style={{
            width: "920px",
            background: "#f6f8f7",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#111827",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", height: "10px" }}>
            <div style={{ flex: 1, background: "#008C45" }} />
            <div style={{ flex: 1, background: "#f1f5f9" }} />
            <div style={{ flex: 1, background: "#CD212A" }} />
          </div>

          <div style={{ padding: "34px 40px 28px" }}>
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 10px 40px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ padding: "34px 34px 26px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "24px",
                    marginBottom: "28px",
                  }}
                >
                  <div style={{ maxWidth: "54%" }}>
                    <div
                      style={{
                        fontSize: "30px",
                        fontWeight: 700,
                        fontFamily: '"Trebuchet MS", "Segoe UI", Arial, sans-serif',
                        color: "#0f172a",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        lineHeight: 1,
                      }}
                    >
                      Giacosa Elio
                    </div>

                    <div style={{ fontSize: "14px", color: "#4b5563", marginBottom: "4px" }}>
                      Corralón y Materiales para la Construcción
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "2px" }}>
                      Batalla de Suipacha 482, San Miguel de Tucumán
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      WhatsApp: 381-558-9875
                    </div>
                  </div>

                  <div
                    style={{
                      minWidth: "250px",
                      textAlign: "right",
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      padding: "16px 18px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#94a3b8",
                        marginBottom: "6px",
                      }}
                    >
                      Número de cotización
                    </div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 900,
                        color: "#008C45",
                        lineHeight: 1.1,
                        marginBottom: "10px",
                      }}
                    >
                      {docNumero}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      Fecha: <span style={{ fontWeight: 700, color: "#374151" }}>{fecha}</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 0.9fr",
                    gap: "12px",
                    marginBottom: "22px",
                  }}
                >
                  <div
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#94a3b8",
                        fontWeight: 800,
                        marginBottom: "6px",
                      }}
                    >
                      Cliente
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                      {nombre || "—"}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#94a3b8",
                        fontWeight: 800,
                        marginBottom: "6px",
                      }}
                    >
                      Teléfono
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
                      {telefono || "—"}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#ecfdf5",
                      border: "1px solid #ccefdc",
                      borderRadius: "16px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        color: "#6b7280",
                        fontWeight: 800,
                        marginBottom: "6px",
                      }}
                    >
                      Forma de pago
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 800, color: "#008C45", lineHeight: 1.3 }}>
                      {formaPagoLabel || "Pendiente"}
                    </div>
                  </div>
                </div>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    marginBottom: "20px",
                    fontSize: "13px",
                    tableLayout: "fixed",
                    overflow: "hidden",
                    borderRadius: "18px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <colgroup>
                    <col style={{ width: "36%" }} />
                    <col style={{ width: "26%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
                  </colgroup>

                  <thead>
                    <tr style={{ background: "#008C45", color: "#ffffff" }}>
                      {["Producto", "Medida", "Cant.", "Precio u.", "Subtotal"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "14px 14px",
                            textAlign:
                              h === "Cant."
                                ? "center"
                                : h === "Precio u." || h === "Subtotal"
                                  ? "right"
                                  : "left",
                            fontWeight: 800,
                            fontSize: "13px",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {cart.map((item, i) => (
                      <tr key={item.id} style={{ background: i % 2 === 0 ? "#ffffff" : "#f9fafb" }}>
                        <td
                          style={{
                            padding: "14px",
                            borderBottom: "1px solid #edf2f7",
                            fontWeight: 700,
                            color: "#111827",
                            lineHeight: 1.45,
                          }}
                        >
                          {item.descripcion}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            borderBottom: "1px solid #edf2f7",
                            color: "#4b5563",
                            lineHeight: 1.45,
                          }}
                        >
                          {item.medida}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            borderBottom: "1px solid #edf2f7",
                            textAlign: "center",
                            fontWeight: 700,
                          }}
                        >
                          {item.cantidad}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            borderBottom: "1px solid #edf2f7",
                            textAlign: "right",
                            color: "#4b5563",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {safeFormatARS(item.precioUnitarioARS)}
                        </td>
                        <td
                          style={{
                            padding: "14px",
                            borderBottom: "1px solid #edf2f7",
                            textAlign: "right",
                            fontWeight: 800,
                            color: "#111827",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {safeFormatARS(item.subtotalARS)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 320px",
                    gap: "18px",
                    alignItems: "stretch",
                  }}
                >
                  <div
                    style={{
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      padding: "18px 20px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#111827",
                        marginBottom: "14px",
                      }}
                    >
                      Resumen de la cotización
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                      <span style={{ color: "#6b7280" }}>Subtotal</span>
                      <span style={{ fontWeight: 800, color: "#111827" }}>{safeFormatARS(totalBase)}</span>
                    </div>

                    {porcentaje !== 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                        <span style={{ color: "#6b7280" }}>
                          {porcentaje < 0 ? `Descuento ${Math.abs(porcentaje)}%` : `Recargo ${porcentaje}%`}
                        </span>
                        <span
                          style={{
                            fontWeight: 800,
                            color: porcentaje < 0 ? "#008C45" : "#b45309",
                          }}
                        >
                          {porcentaje < 0
                            ? `- ${safeFormatARS(Math.abs(ajuste))}`
                            : `+ ${safeFormatARS(Math.abs(ajuste))}`}
                        </span>
                      </div>
                    )}

                    {importeCuota && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                        <span style={{ color: "#6b7280" }}>Valor por cuota</span>
                        <span style={{ fontWeight: 800, color: "#111827" }}>
                          {numCuotas} x {safeFormatARS(importeCuota)}
                        </span>
                      </div>
                    )}

                    <div style={{ marginTop: "18px", fontSize: "12px", color: "#6b7280", lineHeight: 1.5 }}>
                      Cotización válida por 48 hs. Sujeta a disponibilidad de stock.
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#008C45",
                      color: "#ffffff",
                      borderRadius: "22px",
                      padding: "22px 24px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "170px",
                      boxShadow: "0 12px 30px rgba(0,140,69,0.18)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          color: "#d1fae5",
                          marginBottom: "10px",
                        }}
                      >
                        Total final
                      </div>

                      <div
                        style={{
                          fontSize: "38px",
                          fontWeight: 900,
                          lineHeight: 1.1,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {safeFormatARS(totalFinal)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "18px",
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: "#ecfdf5",
                      }}
                    >
                      Para confirmar, escribinos por WhatsApp al 381-558-9875.
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "14px 22px",
                  background: "#fcfcfc",
                  borderTop: "1px solid #eef2f7",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                <span>Giacosa Elio · San Miguel de Tucumán</span>
                <span>WhatsApp: 381-558-9875</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", height: "8px" }}>
            <div style={{ flex: 1, background: "#008C45" }} />
            <div style={{ flex: 1, background: "#f1f5f9" }} />
            <div style={{ flex: 1, background: "#CD212A" }} />
          </div>
        </div>
      </div>
    </div>
  );
}