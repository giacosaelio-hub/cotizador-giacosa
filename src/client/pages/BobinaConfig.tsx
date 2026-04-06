import { useState, useMemo } from "react";
import { Precios, CartItem, BobinaVariante, findBobinaVariante, calcBobinaPrecio, formatARS } from "@/lib/precios";
import { ArrowLeft, Plus, MessageCircle } from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}

const WA_NUMBER = "5493815589875";

function Chips({
  options, value, onChange, disabled = false,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${disabled ? "opacity-30 pointer-events-none" : ""}`}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
            value === o.v
              ? "border-gray-800 bg-gray-800 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function BobinaConfig({ precios, onBack, onAdd }: Props) {
  const [calibre, setCalibre] = useState("");
  const [ancho, setAncho] = useState("");
  const [colorOTipo, setColorOTipo] = useState("");
  const [metrosStr, setMetrosStr] = useState("");
  const [error, setError] = useState("");

  const variantes: BobinaVariante[] = precios.bobinas_variantes ?? [];

  const calibresDisponibles = useMemo(() =>
    [...new Set(variantes.map((v) => v.calibre))].sort((a, b) => a - b),
    [variantes]
  );

  const anchosDisponibles = useMemo(() =>
    calibre
      ? [...new Set(variantes.filter((v) => v.calibre === parseInt(calibre, 10)).map((v) => v.ancho))].sort((a, b) => a - b)
      : [],
    [variantes, calibre]
  );

  const colorOptions = useMemo(() => {
    if (!calibre || !ancho) return [];
    const calNum = parseInt(calibre, 10);
    const anchoNum = parseFloat(ancho);
    return variantes
      .filter((v) => v.calibre === calNum && v.ancho === anchoNum)
      .map((v) => (v.tipo === "Galvanizada" ? "Galvanizada" : v.color ?? ""))
      .filter(Boolean);
  }, [variantes, calibre, ancho]);

  const showColor = colorOptions.length > 1;
  const efectivoColorOTipo = showColor ? colorOTipo : (colorOptions[0] ?? "Galvanizada");

  const metros = parseFloat(metrosStr);
  const metrosValido = metrosStr !== "" && !isNaN(metros) && metros > 0;
  const isWhatsApp = metrosValido && metros > 30;

  const canPreview = calibre !== "" && ancho !== "" && (!showColor || colorOTipo !== "") && metrosValido && !isWhatsApp;

  const preview = useMemo(() => {
    if (!canPreview) return null;
    return calcBobinaPrecio(precios, calibre, parseFloat(ancho), efectivoColorOTipo, metros);
  }, [calibre, ancho, colorOTipo, metros, precios, canPreview, efectivoColorOTipo]);

  function buildDescripcion(): string {
    const cal = `Cal. ${calibre}`;
    const anchoStr = `${parseFloat(ancho).toFixed(2)} mts`;
    if (efectivoColorOTipo && efectivoColorOTipo !== "Galvanizada") {
      return `Bobina Prepintada ${efectivoColorOTipo} ${cal} - ${anchoStr}`;
    }
    return `Bobina Galvanizada ${cal} - ${anchoStr}`;
  }

  function handleAdd() {
    if (!calibre || !ancho) { setError("Seleccioná calibre y ancho"); return; }
    if (showColor && !colorOTipo) { setError("Seleccioná un color o tipo"); return; }
    if (!metrosValido) { setError("Ingresá la cantidad de metros"); return; }
    if (isWhatsApp) return;
    setError("");
    const { precioUnitarioUSD, precioUnitarioARS, subtotalARS } = calcBobinaPrecio(precios, calibre, parseFloat(ancho), efectivoColorOTipo, metros);
    const medida = `${metros.toFixed(2)} ${metros === 1 ? "metro" : "metros"}`;
    onAdd({ tipo: "bobina", descripcion: buildDescripcion(), medida, cantidad: 1, precioUnitarioUSD, precioUnitarioARS, subtotalARS });
  }

  function handleWhatsApp() {
    const txt = `Hola, quiero consultar precio de ${metros} metros de bobina calibre ${calibre} - ${ancho} mts${efectivoColorOTipo && efectivoColorOTipo !== "Galvanizada" ? ` prepintada ${efectivoColorOTipo}` : ""}.`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`, "_blank");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 mb-6 hover:text-gray-700 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🏭</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bobinas de Acero</h2>
          <p className="text-xs text-gray-400 mt-0.5">Vendidas por metro · Calibres {calibresDisponibles.join(", ")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Configuración */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          {/* Calibre */}
          <div className="p-5 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Calibre</p>
            <Chips
              options={calibresDisponibles.map((c) => ({ v: String(c), label: `Cal. ${c}` }))}
              value={calibre}
              onChange={(v) => { setCalibre(v); setAncho(""); setColorOTipo(""); setMetrosStr(""); }}
            />
          </div>

          {/* Ancho */}
          {calibre && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Ancho</p>
              <Chips
                options={anchosDisponibles.map((a) => ({ v: String(a), label: `${a.toFixed(2)} m` }))}
                value={ancho}
                onChange={(v) => { setAncho(v); setColorOTipo(""); }}
              />
            </div>
          )}

          {/* Color / Tipo */}
          {ancho && showColor && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tipo / Color</p>
              <Chips
                options={colorOptions.map((c) => ({ v: c, label: c }))}
                value={colorOTipo}
                onChange={setColorOTipo}
              />
            </div>
          )}

          {/* Metros */}
          {ancho && (!showColor || colorOTipo) && (
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Metros a comprar</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0.1}
                  step={0.01}
                  value={metrosStr}
                  onChange={(e) => setMetrosStr(e.target.value)}
                  placeholder="0.00"
                  className="text-3xl font-bold border-0 focus:outline-none bg-transparent text-gray-900 w-36"
                />
                <span className="text-base text-gray-400 font-medium">metros</span>
              </div>
              {isWhatsApp && (
                <p className="text-amber-600 text-xs mt-2 font-medium">
                  Más de 30 metros — pedido mayorista, consultá por WhatsApp
                </p>
              )}
            </div>
          )}
        </div>

        {/* WhatsApp CTA for large orders */}
        {isWhatsApp && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-600 mb-4 font-medium">
              Para pedidos de <strong>más de 30 metros</strong>, un vendedor te da el mejor precio.
            </p>
            <button
              onClick={handleWhatsApp}
              className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
          </div>
        )}

        {/* Price preview */}
        {preview && !isWhatsApp && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Resumen</p>
            <p className="text-xs text-gray-500 mb-4">{buildDescripcion()}</p>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Precio por metro</span>
              <span className="font-semibold text-gray-800">{formatARS(preview.precioUnitarioARS)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total ({metros.toFixed(2)} m)</span>
              <span className="text-2xl font-bold text-gray-900">{formatARS(preview.subtotalARS)}</span>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm font-medium">⚠ {error}</p>}

        {!isWhatsApp && (
          <button
            onClick={handleAdd}
            disabled={!preview}
            className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: preview ? "#008C45" : "#9ca3af" }}
          >
            <Plus className="w-5 h-5" />
            Agregar a la cotización
          </button>
        )}
      </div>
    </div>
  );
}
