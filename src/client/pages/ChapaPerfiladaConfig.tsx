import { useState, useMemo } from "react";
import {
  Precios, CartItem, PERFILES, MATERIALES, CALIBRES_CHAPA, PIES_OPTIONS,
  COLORES_PREPINTADA, buildPrecioKey, calcChapaPrecio, formatARS,
} from "@/lib/precios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}

function formatMetros(pies: number, anchoUtil: number): string {
  const largom = (pies * 0.3048).toFixed(2);
  return `${anchoUtil.toFixed(2)} mts × ${largom} mts (${pies === 42.62 ? "42.62" : pies} pies)`;
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

export default function ChapaPerfiladaConfig({ precios, onBack, onAdd }: Props) {
  const [perfil, setPerfil] = useState("");
  const [material, setMaterial] = useState("");
  const [calibre, setCalibre] = useState("");
  const [color, setColor] = useState("");
  const [pies, setPies] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");

  const isPrepintada = material === "prepintada";

  const perfilData = PERFILES.find((p) => p.key === perfil);
  const perfilLabel = perfilData?.label ?? "";
  const anchoUtil = perfilData?.anchoUtil ?? 1;
  const materialLabel = MATERIALES.find((m) => m.key === material)?.label ?? "";

  const materialesDisponibles = useMemo(() => {
    if (!perfil) return MATERIALES;
    return MATERIALES.filter((m) => {
      if (perfil === "trapezoidal" && m.key === "galv") return false;
      return CALIBRES_CHAPA.some((c) => buildPrecioKey(perfil, m.key, c) in precios.chapas_perfiladas);
    });
  }, [perfil, precios]);

  const calibresDisponibles = useMemo(() => {
    if (!perfil || !material) return [];
    return CALIBRES_CHAPA.filter((c) => buildPrecioKey(perfil, material, c) in precios.chapas_perfiladas);
  }, [perfil, material, precios]);

  const preview = useMemo(() => {
    if (!perfil || !material || !calibre || (isPrepintada && !color) || !pies || cantidad < 1) return null;
    return calcChapaPrecio(precios, perfil, material, calibre, Number(pies), cantidad);
  }, [perfil, material, calibre, color, pies, cantidad, precios, isPrepintada]);

  function handleAdd() {
    if (!perfil || !material || !calibre || !pies || cantidad < 1) { setError("Completá la configuración"); return; }
    if (isPrepintada && !color) { setError("Seleccioná un color"); return; }
    if (cantidad > 300) { setError("Cantidad máxima: 300 unidades"); return; }
    setError("");
    const { precioUnitarioUSD, precioUnitarioARS, subtotalARS } = calcChapaPrecio(precios, perfil, material, calibre, Number(pies), cantidad);
    const colorStr = isPrepintada && color ? ` ${color}` : "";
    const desc = `${perfilLabel} ${materialLabel}${colorStr} Cal. ${calibre}`;
    const medida = formatMetros(Number(pies), anchoUtil);
    onAdd({ tipo: "chapa_perfilada", descripcion: desc, medida, cantidad, precioUnitarioUSD, precioUnitarioARS, subtotalARS });
  }

  const perfilDesc = perfil === "sinusoidal" ? "Ancho útil 1.00 m" : perfil === "trapezoidal" ? "Ancho útil 1.10 m" : "";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 mb-6 hover:text-gray-700 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">🏭</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Chapas para Techo</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cortadas a medida · Sinusoidal y Trapezoidal</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Configuración */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

          {/* Perfil */}
          <div className="p-5 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Perfil</p>
            <Chips
              options={PERFILES.map((p) => ({ v: p.key, label: p.label.replace("Chapa ", "") }))}
              value={perfil}
              onChange={(v) => { setPerfil(v); setMaterial(""); setCalibre(""); setColor(""); setPies(""); }}
            />
            {perfilDesc && <p className="text-xs text-gray-400 mt-2">{perfilDesc}</p>}
          </div>

          {/* Material */}
          {perfil && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Material</p>
              <Chips
                options={materialesDisponibles.map((m) => ({ v: m.key, label: m.label }))}
                value={material}
                onChange={(v) => { setMaterial(v); setCalibre(""); setColor(""); setPies(""); }}
              />
            </div>
          )}

          {/* Calibre */}
          {material && calibresDisponibles.length > 0 && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Calibre</p>
              <Chips
                options={calibresDisponibles.map((c) => ({ v: c, label: `Cal. ${c}` }))}
                value={calibre}
                onChange={(v) => { setCalibre(v); setColor(""); setPies(""); }}
              />
              <p className="text-xs text-gray-400 mt-2">Cal. 24 = más grueso · Cal. 27 = más liviano</p>
            </div>
          )}

          {/* Color — solo prepintada */}
          {isPrepintada && calibre && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Color</p>
              <Chips
                options={COLORES_PREPINTADA.map((c) => ({ v: c, label: c }))}
                value={color}
                onChange={(v) => { setColor(v); setPies(""); }}
              />
            </div>
          )}

          {/* Largo */}
          {calibre && (!isPrepintada || color) && (
            <div className="p-5 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Largo</p>
              <Select value={pies} onValueChange={setPies}>
                <SelectTrigger className="border border-gray-200 rounded-lg text-sm focus:ring-0 focus:border-gray-400 bg-white">
                  <SelectValue placeholder="Seleccioná el largo..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {PIES_OPTIONS.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {anchoUtil.toFixed(2)} × {(p * 0.3048).toFixed(2)} mts ({p === 42.62 ? "42.62" : p} pies)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cantidad */}
          {pies && (
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
                <p className="text-amber-600 text-xs mt-2 font-medium">
                  Para pedidos grandes te recomendamos consultar directamente con ventas
                </p>
              )}
            </div>
          )}
        </div>

        {/* Price preview */}
        {preview && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Resumen</p>
            <p className="text-xs text-gray-500 mb-4">
              {perfilLabel} {materialLabel}{isPrepintada && color ? ` ${color}` : ""} Cal. {calibre} · {pies && `${(Number(pies) * 0.3048).toFixed(2)} mts`}
            </p>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Precio por unidad</span>
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
