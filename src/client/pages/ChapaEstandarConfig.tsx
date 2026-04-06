import { useState, useMemo } from "react";
import {
  Precios, CartItem, CHAPAS_ESTANDAR_CATS, ESTANDAR_VARIANTES, MEDIDA_LABELS,
  COLORES_PREPINTADA, buildEstandarKey, calcEstandarPrecio, formatARS,
} from "@/lib/precios";
import { ArrowLeft, Plus } from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}

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

export default function ChapaEstandarConfig({ precios, onBack, onAdd }: Props) {
  const [categoria, setCategoria] = useState("");
  const [calibre, setCalibre] = useState("");
  const [medida, setMedida] = useState("");
  const [color, setColor] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");

  const isPrepintada = categoria === "lisa_prepintada";
  const catLabel = CHAPAS_ESTANDAR_CATS.find((c) => c.key === categoria)?.label ?? "";
  const variantesParaCat = ESTANDAR_VARIANTES[categoria] ?? [];
  const calibresDisponibles = variantesParaCat.map((v) => v.calibre);
  const medidasDisponibles = variantesParaCat.find((v) => v.calibre === calibre)?.medidas ?? [];
  const precioKey = calibre && medida ? buildEstandarKey(calibre, medida) : "";

  const preview = useMemo(() => {
    if (!categoria || !calibre || !medida || (isPrepintada && !color) || cantidad < 1) return null;
    return calcEstandarPrecio(precios, categoria, precioKey, cantidad);
  }, [categoria, calibre, medida, color, cantidad, precios, isPrepintada, precioKey]);

  function buildDescripcion(): string {
    const medidaLabel = MEDIDA_LABELS[medida] ?? medida;
    if (isPrepintada && color) return `${catLabel} ${color} ${calibre} — ${medidaLabel}`;
    return `${catLabel} ${calibre} — ${medidaLabel}`;
  }

  function handleAdd() {
    if (!categoria || !calibre || !medida) { setError("Completá la configuración del producto"); return; }
    if (isPrepintada && !color) { setError("Seleccioná un color"); return; }
    if (cantidad < 1 || cantidad > 300) { setError("Cantidad inválida (máx. 300)"); return; }
    setError("");
    const { precioUnitarioUSD, precioUnitarioARS, subtotalARS } = calcEstandarPrecio(precios, categoria, precioKey, cantidad);
    const medidaLabel = MEDIDA_LABELS[medida] ?? medida;
    onAdd({ tipo: "chapa_estandar", descripcion: buildDescripcion(), medida: medidaLabel, cantidad, precioUnitarioUSD, precioUnitarioARS, subtotalARS });
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
          <h2 className="text-xl font-bold text-gray-900">Chapas Estándar</h2>
          <p className="text-xs text-gray-400 mt-0.5">Medidas fijas · Precio por unidad · IVA incluido</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Configuración */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          {/* Categoría */}
          <div className="p-5 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Categoría</p>
            <div className="grid grid-cols-2 gap-2">
              {CHAPAS_ESTANDAR_CATS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => { setCategoria(c.key); setCalibre(""); setMedida(""); setColor(""); }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-semibold border-2 text-left transition-all leading-snug ${
                    categoria === c.key
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-800"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calibre */}
          {categoria && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Calibre</p>
              <Chips
                options={calibresDisponibles.map((c) => ({ v: c, label: c }))}
                value={calibre}
                onChange={(v) => { setCalibre(v); setMedida(""); setColor(""); }}
              />
            </div>
          )}

          {/* Medida */}
          {calibre && medidasDisponibles.length > 0 && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Medida</p>
              <Chips
                options={medidasDisponibles.map((m) => ({ v: m, label: MEDIDA_LABELS[m] ?? m }))}
                value={medida}
                onChange={(v) => { setMedida(v); if (!isPrepintada) setColor(""); }}
              />
            </div>
          )}

          {/* Color — solo prepintada */}
          {isPrepintada && medida && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Color</p>
              <Chips
                options={COLORES_PREPINTADA.map((c) => ({ v: c, label: c }))}
                value={color}
                onChange={setColor}
              />
            </div>
          )}

          {/* Cantidad */}
          {(medida && (!isPrepintada || color)) && (
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Cantidad</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="w-9 h-9 rounded-lg border-2 border-gray-200 text-gray-600 font-bold text-lg hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center"
                >−</button>
                <input
                  type="number" min={1} max={300} value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Math.min(300, Number(e.target.value))))}
                  className="w-20 text-center text-xl font-bold border-0 focus:outline-none bg-transparent text-gray-900"
                />
                <button
                  onClick={() => setCantidad((c) => Math.min(300, c + 1))}
                  className="w-9 h-9 rounded-lg border-2 border-gray-200 text-gray-600 font-bold text-lg hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center"
                >+</button>
                <span className="text-sm text-gray-400 ml-1">{cantidad === 1 ? "unidad" : "unidades"}</span>
              </div>
              {cantidad > 50 && (
                <p className="text-amber-600 text-xs mt-2 font-medium">Para cantidades grandes te recomendamos consultar con ventas</p>
              )}
            </div>
          )}
        </div>

        {/* Price preview */}
        {preview && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Resumen</p>
            <p className="text-xs text-gray-500 mb-4">{buildDescripcion()}</p>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Precio unitario</span>
              <span className="font-semibold text-gray-800">{formatARS(preview.precioUnitarioARS)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-900">Total ({cantidad === 1 ? "1 unidad" : `${cantidad} u.`})</span>
              <span className="text-2xl font-bold text-gray-900">{formatARS(preview.subtotalARS)}</span>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm font-medium">⚠ {error}</p>}

        <button
          onClick={handleAdd}
          disabled={!preview}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: preview ? "#008C45" : "#9ca3af" }}
        >
          <Plus className="w-5 h-5" />
          Agregar a la cotización
        </button>
      </div>
    </div>
  );
}
