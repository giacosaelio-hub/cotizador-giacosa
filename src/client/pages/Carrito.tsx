import { useRef, useState } from "react";
import { CartItem, Precios, TarjetaOpcion, CuotaOpcion, formatARS, formatFecha } from "@/lib/precios";
import { ArrowLeft, Trash2, Download, MessageCircle, Plus, ShoppingCart, CheckCircle } from "lucide-react";
import { toPng } from "html-to-image";

interface Props {
  cart: CartItem[];
  precios: Precios;
  onUpdateCantidad: (id: string, cantidad: number) => void;
  onRemove: (id: string) => void;
  onAgregarMas: () => void;
  onClearCart: () => void;
}

export default function Carrito({ cart, precios, onUpdateCantidad, onRemove, onAgregarMas, onClearCart }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [medioPago, setMedioPago] = useState<"" | "efectivo" | "transferencia" | "tarjeta">("");
  const [tarjetaId, setTarjetaId] = useState("");
  const [cuotaKey, setCuotaKey] = useState("");
  const [docNumero, setDocNumero] = useState("");
  const [preview, setPreview] = useState<{ pngDataUrl: string; numero: string } | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const fecha = formatFecha(new Date());
  const totalBase = cart.reduce((sum, item) => sum + item.subtotalARS, 0);
  const formasPago: TarjetaOpcion[] = precios.formas_pago ?? [];
  const tarjetaSeleccionada: TarjetaOpcion | null = formasPago.find((t) => t.id === tarjetaId) ?? null;
  const cuotasDisponibles: CuotaOpcion[] = (tarjetaSeleccionada?.cuotas ?? []).filter((c) => c.activo);
  const cuotaSeleccionada: CuotaOpcion | null = cuotasDisponibles.find((c) => c.key === cuotaKey) ?? null;

  const porcentaje =
    medioPago === "efectivo" ? -20
    : medioPago === "transferencia" ? -15
    : cuotaSeleccionada ? cuotaSeleccionada.porcentaje : 0;
  const totalFinal = totalBase * (1 + porcentaje / 100);
  const ajuste = totalFinal - totalBase;

  const numCuotas = cuotaSeleccionada && cuotaSeleccionada.key !== "zeta" && cuotaSeleccionada.key !== "1"
    ? parseInt(cuotaSeleccionada.key, 10)
    : 0;
  const importeCuota = numCuotas > 1 ? totalFinal / numCuotas : null;

  const formaPagoLabel =
    medioPago === "efectivo"
      ? "Efectivo – Descuento 20%"
      : medioPago === "transferencia"
        ? "Transferencia/QR – Descuento 15%"
        : tarjetaSeleccionada && cuotaSeleccionada
          ? `${tarjetaSeleccionada.label} – ${cuotaSeleccionada.label}`
          : "";

  const telefonoValido = telefono.replace(/\D/g, "").length >= 7;
  const hasPayment =
    medioPago === "efectivo" ||
    medioPago === "transferencia" ||
    (medioPago === "tarjeta" && tarjetaId !== "" && cuotaKey !== "");
  const canGenerar = cart.length > 0 && nombre.trim().length > 0 && telefonoValido && hasPayment;

  async function handleGenerar() {
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
      const el = docRef.current!;
      pngDataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        width: 860,
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
            precioUnitarioARS: item.precioUnitarioARS,
            subtotalARS: item.subtotalARS,
          })),
          totalARS: totalFinal,
          dolar: precios.dolar,
          formaPago: formaPagoLabel || undefined,
          importeCuota: importeCuota ?? undefined,
          imagenBase64: base64,
        }),
      });
    } catch {
      // Send failed silently — still show preview
    }

    setPreview({ pngDataUrl, numero });
    setLoading(false);
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
    const pagoStr = formaPagoLabel ? ` Pago: ${formaPagoLabel}.` : "";
    const text = encodeURIComponent(
      `Hola, quiero confirmar la cotización ${num}.${pagoStr} ¿Hay stock disponible?`
    );
    window.open(`https://wa.me/5493815589875?text=${text}`, "_blank");
  }

  function handleNuevaCotizacion() {
    setPreview(null);
    setNombre("");
    setTelefono("");
    setMedioPago("");
    setTarjetaId("");
    setCuotaKey("");
  }

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (cart.length === 0 && !preview) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#f0faf4" }}>
          <ShoppingCart className="w-9 h-9" style={{ color: "#008C45" }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tu cotización está vacía</h3>
        <p className="text-gray-500 text-sm mb-6">Agregá productos para comenzar</p>
        <button
          onClick={onAgregarMas}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          style={{ background: "#008C45" }}
        >
          <Plus className="w-4 h-4" /> Agregar productos
        </button>
      </div>
    );
  }

  // ── Preview ─────────────────────────────────────────────────────────────────
  if (preview) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#f0faf4" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "#008C45" }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Revisá tu cotización antes de confirmar</h2>
          <p className="text-sm text-gray-500 mt-1">Cotización <strong>{preview.numero}</strong></p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <img src={preview.pngDataUrl} alt="Vista previa de cotización" className="w-full" />
        </div>

        <p className="text-center text-sm text-gray-500 mb-5">Estás a un paso de confirmar tu pedido</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleWhatsApp}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            style={{ background: "#25D366" }}
          >
            <MessageCircle className="w-5 h-5" />
            Confirmar pedido por WhatsApp
          </button>

          <button
            onClick={handleDescargar}
            className="w-full py-4 rounded-2xl text-gray-700 font-bold text-base flex items-center justify-center gap-2 transition-all border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] bg-white"
          >
            <Download className="w-5 h-5" />
            Descargar cotización
          </button>

          <button
            onClick={handleNuevaCotizacion}
            className="w-full py-3 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
          >
            Nueva cotización
          </button>
        </div>
      </div>
    );
  }

  // ── Main cart view ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onAgregarMas} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#008C45] transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Inicio
        </button>
        <h2 className="text-xl font-bold text-gray-900">Tu Cotización</h2>
        <button
          onClick={onAgregarMas}
          className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border-2 transition-all"
          style={{ borderColor: "#008C45", color: "#008C45" }}
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {/* Products table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-0 bg-gray-50 border-b border-gray-100 px-2 py-3">
          {["Producto", "Medida", "Cant.", "Precio u.", "Subtotal", ""].map((h) => (
            <div key={h} className="text-xs font-bold uppercase tracking-wider text-gray-400 px-2">{h}</div>
          ))}
        </div>

        {cart.map((item, i) => (
          <div
            key={item.id}
            className={`grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 md:gap-0 px-2 py-4 ${i < cart.length - 1 ? "border-b border-gray-50" : ""}`}
          >
            <div className="font-semibold text-gray-900 px-2 flex items-center gap-2">
              <span className="text-base md:hidden text-gray-400">Producto:</span>
              {item.descripcion}
            </div>
            <div className="text-sm text-gray-500 px-2 flex items-center gap-2">
              <span className="text-base md:hidden text-gray-400">Medida:</span>
              {item.medida}
            </div>
            <div className="px-2 flex items-center gap-2">
              <span className="text-base md:hidden text-gray-400">Cant.:</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => onUpdateCantidad(item.id, Math.max(1, item.cantidad - 1))}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-base font-bold hover:border-[#008C45] hover:text-[#008C45] transition-colors flex items-center justify-center">−</button>
                <span className="w-8 text-center font-bold text-sm" style={{ color: "#008C45" }}>{item.cantidad}</span>
                <button onClick={() => onUpdateCantidad(item.id, Math.min(300, item.cantidad + 1))}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 text-base font-bold hover:border-[#008C45] hover:text-[#008C45] transition-colors flex items-center justify-center">+</button>
              </div>
            </div>
            <div className="text-sm text-gray-500 px-2 flex items-center gap-2">
              <span className="md:hidden text-gray-400">Precio u.:</span>
              {formatARS(item.precioUnitarioARS)}
            </div>
            <div className="font-bold text-gray-900 px-2 flex items-center gap-2">
              <span className="md:hidden text-gray-400">Subtotal:</span>
              {formatARS(item.subtotalARS)}
            </div>
            <div className="px-2 flex items-center justify-end">
              <button onClick={() => onRemove(item.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-[#CD212A] hover:bg-red-50 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Subtotal + adjustment + Total */}
        {(medioPago !== "" && (medioPago === "efectivo" || medioPago === "transferencia" || cuotaSeleccionada)) && (
          <div className="px-6 py-3 border-t flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatARS(totalBase)}</span>
          </div>
        )}
        {porcentaje !== 0 && (medioPago === "efectivo" || medioPago === "transferencia" || cuotaSeleccionada) && (
          <div className={`px-6 py-2 flex justify-between text-sm font-semibold ${porcentaje < 0 ? "" : "text-amber-600"}`}
            style={{ color: porcentaje < 0 ? "#008C45" : undefined }}>
            <span>
              {porcentaje < 0
                ? `Descuento ${formaPagoLabel} (${Math.abs(porcentaje)}%)`
                : `Recargo ${formaPagoLabel} (+${porcentaje}%)`}
            </span>
            <span>{porcentaje < 0 ? `− ${formatARS(Math.abs(ajuste))}` : `+ ${formatARS(ajuste)}`}</span>
          </div>
        )}

        <div className="px-6 py-5 border-t-2 flex flex-col gap-1" style={{ borderColor: "#008C45", background: "linear-gradient(135deg, #f0faf4 0%, #fff 100%)" }}>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800 text-lg">TOTAL DE LA COTIZACIÓN</span>
            <span className="text-3xl font-black" style={{ color: "#008C45" }}>{formatARS(totalFinal)}</span>
          </div>
          {importeCuota && (
            <div className="flex justify-end text-sm font-semibold text-gray-500">
              {numCuotas} cuotas de {formatARS(importeCuota)}
            </div>
          )}
        </div>
      </div>

      {/* ── Forma de pago ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Forma de pago</p>

        {/* Level 1: Efectivo / Transferencia / Tarjeta */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => { setMedioPago("efectivo"); setTarjetaId(""); setCuotaKey(""); }}
            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-colors ${
              medioPago === "efectivo"
                ? "border-[#008C45] text-[#008C45] bg-green-50"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            💵 Efectivo
          </button>
          <button
            onClick={() => { setMedioPago("transferencia"); setTarjetaId(""); setCuotaKey(""); }}
            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-colors ${
              medioPago === "transferencia"
                ? "border-[#008C45] text-[#008C45] bg-green-50"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            📲 Transfer/QR
          </button>
          <button
            onClick={() => { setMedioPago("tarjeta"); }}
            className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-colors ${
              medioPago === "tarjeta"
                ? "border-[#1a1a2e] text-[#1a1a2e] bg-gray-50"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            💳 Tarjeta
          </button>
        </div>

        {/* Efectivo info */}
        {medioPago === "efectivo" && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 font-medium">
            ✅ Se aplica un descuento del 20% al total
          </div>
        )}

        {/* Transferencia/QR info */}
        {medioPago === "transferencia" && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-700 font-medium">
            ✅ Se aplica un descuento del 15% al total
          </div>
        )}

        {/* Tarjeta selectors */}
        {medioPago === "tarjeta" && (
          <div className="flex flex-col gap-3">
            <select
              value={tarjetaId}
              onChange={(e) => { setTarjetaId(e.target.value); setCuotaKey(""); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#008C45] bg-white"
            >
              <option value="">Seleccioná la tarjeta...</option>
              {formasPago.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>

            {tarjetaId && cuotasDisponibles.length > 0 && (
              <select
                value={cuotaKey}
                onChange={(e) => setCuotaKey(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#008C45] bg-white"
              >
                <option value="">Seleccioná las cuotas...</option>
                {cuotasDisponibles.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                    {c.porcentaje !== 0
                      ? c.porcentaje > 0
                        ? ` (+${c.porcentaje}% recargo)`
                        : ` (${c.porcentaje}% descuento)`
                      : " (sin recargo)"}
                  </option>
                ))}
              </select>
            )}

            {cuotaSeleccionada && (
              <div className={`rounded-xl px-4 py-2.5 text-sm font-medium border ${
                cuotaSeleccionada.porcentaje < 0
                  ? "bg-green-50 border-green-200 text-green-700"
                  : cuotaSeleccionada.porcentaje > 0
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-gray-50 border-gray-200 text-gray-600"
              }`}>
                {cuotaSeleccionada.porcentaje < 0
                  ? `✅ Descuento del ${Math.abs(cuotaSeleccionada.porcentaje)}% aplicado`
                  : cuotaSeleccionada.porcentaje > 0
                    ? `⚠️ Recargo del ${cuotaSeleccionada.porcentaje}% aplicado`
                    : "✅ Sin recargo"}
                {importeCuota && (
                  <span className="block font-bold mt-0.5">
                    {numCuotas} cuotas de {formatARS(importeCuota)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client data */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-4 mb-4 flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Datos del cliente</p>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cliente-nombre">Nombre completo</label>
          <input
            id="cliente-nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Juan Pérez"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#008C45] transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="cliente-telefono">Teléfono</label>
          <input
            id="cliente-telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 381 555 1234"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#008C45] transition-colors"
          />
          {telefono.length > 0 && !telefonoValido && (
            <p className="text-xs text-[#CD212A] mt-0.5">Ingresá al menos 7 dígitos numéricos</p>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-xs text-amber-700 space-y-1">
        <p>⚠️ Cotización sujeta a disponibilidad de stock al momento de la confirmación.</p>
        <p>⚠️ Los precios pueden variar sin previo aviso.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-[#CD212A] text-sm rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
          <span className="text-base flex-shrink-0">⚠️</span> {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleGenerar}
          disabled={loading || !canGenerar}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "#008C45" }}
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generando...</>
          ) : (
            <>Generar Cotización</>
          )}
        </button>
        {!canGenerar && !loading && (
          <p className="text-xs text-center text-gray-400">
            {!hasPayment
              ? "Seleccioná una forma de pago para continuar"
              : "Completá nombre y teléfono para continuar"}
          </p>
        )}
      </div>

      {/* ── Hidden PNG document ─────────────────────────────────────────────── */}
      <div style={{ position: "absolute", top: 0, left: "-9999px", overflow: "hidden" }}>
        <div
          ref={docRef}
          style={{
            width: "860px",
            backgroundColor: "#ffffff",
            fontFamily: "Arial, Helvetica, sans-serif",
            padding: "0",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", height: "8px" }}>
            <div style={{ flex: 1, background: "#008C45" }} />
            <div style={{ flex: 1, background: "#dddddd" }} />
            <div style={{ flex: 1, background: "#CD212A" }} />
          </div>

          <div style={{ padding: "36px 44px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <div style={{ fontSize: "28px", fontWeight: "900", color: "#111", letterSpacing: "-0.5px" }}>GIACOSA ELIO</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "3px" }}>Corralón y Materiales para la Construcción</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>📍 Batalla de Suipacha 482, San Miguel de Tucumán</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "1px" }}>WhatsApp: 381-558-9875</div>
                <div style={{ display: "flex", height: "2px", marginTop: "10px", width: "220px" }}>
                  <div style={{ flex: 1, background: "#008C45" }} />
                  <div style={{ flex: 1, background: "#ddd" }} />
                  <div style={{ flex: 1, background: "#CD212A" }} />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#aaa", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>Nº de Cotización</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#008C45", marginTop: "2px" }}>{docNumero}</div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "4px" }}>Fecha: {fecha}</div>
              </div>
            </div>

            {/* Client info */}
            <div style={{ background: "#f8fdf9", border: "1px solid #d1f0df", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "13px", color: "#444", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: "700" }}>Cliente:</span> {nombre || "—"}
                <span style={{ marginLeft: "28px" }}><span style={{ fontWeight: "700" }}>Tel:</span> {telefono || "—"}</span>
              </div>
              {formaPagoLabel && (
                <div style={{ fontSize: "12px", color: "#008C45", fontWeight: "700", textAlign: "right" }}>
                  💳 {formaPagoLabel}
                </div>
              )}
            </div>

            {/* Products table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "13px", tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "34%" }} />
                <col style={{ width: "28%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#008C45", color: "white" }}>
                  {["Producto", "Medida", "Cant.", "Precio u.", "Subtotal"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: h === "Cant." ? "center" : h === "Precio u." || h === "Subtotal" ? "right" : "left", fontWeight: "700", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cart.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fdf9" }}>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #edf7f1", fontWeight: "600", wordBreak: "break-word", lineHeight: "1.4" }}>{item.descripcion}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #edf7f1", color: "#555", wordBreak: "break-word", lineHeight: "1.4" }}>{item.medida}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #edf7f1", textAlign: "center" }}>{item.cantidad}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #edf7f1", textAlign: "right", color: "#555", whiteSpace: "nowrap" }}>{formatARS(item.precioUnitarioARS)}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid #edf7f1", textAlign: "right", fontWeight: "700", whiteSpace: "nowrap" }}>{formatARS(item.subtotalARS)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Discount/recargo row */}
            {porcentaje !== 0 && formaPagoLabel && (
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "24px", padding: "8px 14px", background: porcentaje < 0 ? "#f0faf4" : "#fffbea", borderRadius: "6px", marginBottom: "8px", fontSize: "13px" }}>
                <span style={{ color: "#555" }}>Subtotal: {formatARS(totalBase)}</span>
                <span style={{ color: porcentaje < 0 ? "#008C45" : "#b45309", fontWeight: "700" }}>
                  {porcentaje < 0
                    ? `Descuento ${Math.abs(porcentaje)}%: − ${formatARS(Math.abs(ajuste))}`
                    : `Recargo ${porcentaje}%: + ${formatARS(ajuste)}`}
                </span>
              </div>
            )}

            {/* Total box */}
            <div style={{ background: "#008C45", color: "white", borderRadius: "10px", padding: "16px 22px", marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: "700" }}>
                  TOTAL{medioPago === "efectivo" ? " (EFECTIVO)" : medioPago === "transferencia" ? " (TRANSFERENCIA)" : cuotaSeleccionada && porcentaje !== 0 ? ` (${porcentaje > 0 ? "+" : ""}${porcentaje}%)` : ""}
                </span>
                <span style={{ fontSize: "28px", fontWeight: "900" }}>{formatARS(totalFinal)}</span>
              </div>
              {importeCuota && (
                <div style={{ textAlign: "right", fontSize: "13px", opacity: 0.85, marginTop: "4px" }}>
                  {numCuotas} cuotas de {formatARS(importeCuota)}
                </div>
              )}
            </div>

            <div style={{ fontSize: "11px", color: "#888", textAlign: "center", marginBottom: "16px" }}>
              Estás a un paso de confirmar tu pedido
            </div>

            <div style={{ fontSize: "10px", color: "#aaa", borderTop: "1px solid #eee", paddingTop: "10px", marginBottom: "10px" }}>
              <div>• Cotización sujeta a disponibilidad de stock al momento de la confirmación.</div>
              <div>• Los precios pueden variar sin previo aviso.</div>
            </div>
            <div style={{ background: "#fffbea", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px", marginBottom: "10px", fontSize: "11px", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>⭐</span>
              <span>Tu opinión nos ayuda a mejorar. Si tu experiencia fue buena, podés dejarnos una reseña en Google.</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#bbb", fontSize: "11px", borderTop: "1px solid #f0f0f0", paddingTop: "10px" }}>
              <span>Cotización válida por 48 hs · Precios en pesos argentinos</span>
              <span>Batalla de Suipacha 482, San Miguel de Tucumán</span>
            </div>
          </div>

          <div style={{ display: "flex", height: "5px" }}>
            <div style={{ flex: 1, background: "#008C45" }} />
            <div style={{ flex: 1, background: "#dddddd" }} />
            <div style={{ flex: 1, background: "#CD212A" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
