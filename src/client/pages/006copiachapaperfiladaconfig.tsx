import React, { useState, useMemo } from "react";
import {
  Precios,
  CartItem,
  COLORES_PREPINTADA,
  PIES_OPTIONS,
  calcChapaPrecio,
  formatARS,
} from "@/lib/precios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus } from "lucide-react";

// Etiquetas visuales para mostrar en la UI (no hardcodean disponibilidad)
const PERFIL_LABELS: Record<string, { label: string; anchoUtil: number }> = {
  sinusoidal: { label: "Sinusoidal", anchoUtil: 1.0 },
  trapezoidal: { label: "Trapezoidal", anchoUtil: 1.1 },
};
const MATERIAL_LABELS: Record<string, string> = {
  galv: "Galvanizada",
  cincalum: "Cincalum",
  prepintada: "Prepintada",
};
const PERFIL_IMAGES: Record<string, string> = {
  sinusoidal: "/images/configurador/perfiles/sinusoidal.png",
  trapezoidal: "/images/configurador/perfiles/trapezoidal.png",
};
const MATERIAL_IMAGES: Record<string, string> = {
  galv: "/images/configurador/materiales/galvanizada.png",
  cincalum: "/images/configurador/materiales/cincalum.png",
  prepintada: "/images/configurador/materiales/prepintada.png",
};
const MATERIAL_DESCS: Record<string, string> = {
  galv: "Excelente resistencia y uso estructural.",
  cincalum: "Durabilidad superior para exterior.",
  prepintada: "Terminación color lista para instalar.",
};
const COLOR_SWATCHES: Record<string, string> = {
  azul: "#1E40AF",
  gris: "#6B7280",
  celeste: "#38BDF8",
  negra: "#111827",
  negro: "#111827",
  roja: "#DC2626",
  rojo: "#DC2626",
  verde: "#15803D",
};

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
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all ${
            value === o.v
              ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
              : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-gray-800"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Helpers para sacar info de las keys reales
function parseKey(key: string) {
  // Ej: "sinusoidal_galv_24" => { perfil: "sinusoidal", material: "galv", calibre: "24" }
  const [perfil, material, calibre] = key.split("_");
  return { perfil, material, calibre };
}

export default function ChapaPerfiladaConfig({ precios, onBack, onAdd }: {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}) {
  // Estado
  const [perfil, setPerfil] = useState("");
  const [material, setMaterial] = useState("");
  const [calibre, setCalibre] = useState("");
  const [color, setColor] = useState("");
  const [pies, setPies] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");

  // 2. Fuente de verdad: sacar todo desde Object.keys(precios.chapas_perfiladas)
  const keys = useMemo(() => Object.keys(precios.chapas_perfiladas), [precios]);

  // 5. Derivar los perfiles reales existentes
  const perfilesDisponibles = useMemo(() => {
    const found = new Set<string>();
    keys.forEach((k) => {
      const { perfil } = parseKey(k);
      if (PERFIL_LABELS[perfil]) found.add(perfil);
    });
    return Array.from(found).map((p) => ({
      v: p,
      label: PERFIL_LABELS[p]?.label || p,
      anchoUtil: PERFIL_LABELS[p]?.anchoUtil || 1,
    }));
  }, [keys]);

  // 6. Derivar materiales desde las keys reales para el perfil elegido
  const materialesDisponibles = useMemo(() => {
    if (!perfil) return [];
    const found = new Set<string>();
    keys.forEach((k) => {
      const parsed = parseKey(k);
      if (parsed.perfil === perfil && MATERIAL_LABELS[parsed.material]) {
        found.add(parsed.material);
      }
    });
    return Array.from(found).map((m) => ({
      v: m,
      label: MATERIAL_LABELS[m] || m,
    }));
  }, [keys, perfil]);

  // 7. Derivar calibres disponibles desde las keys reales para perfil + material
  const calibresDisponibles = useMemo(() => {
    if (!perfil || !material) return [];
    const found = new Set<string>();
    keys.forEach((k) => {
      const parsed = parseKey(k);
      if (parsed.perfil === perfil && parsed.material === material) {
        found.add(parsed.calibre);
      }
    });
    return Array.from(found).sort((a, b) => Number(a) - Number(b));
  }, [keys, perfil, material]);

  // Para etiquetas visuales y resumen
  const perfilLabel = perfil && PERFIL_LABELS[perfil] ? PERFIL_LABELS[perfil].label : "";
  const anchoUtil = perfil && PERFIL_LABELS[perfil] ? PERFIL_LABELS[perfil].anchoUtil : 1;
  const materialLabel = material && MATERIAL_LABELS[material] ? MATERIAL_LABELS[material] : "";

  // 11. Construir la key real
  const keyReal = perfil && material && calibre ? `${perfil}_${material}_${calibre}` : "";

  // 12. Verificar si la combinación seleccionada existe
  const combinacionValida = keyReal && keys.includes(keyReal);

  // 5. isPrepintada para step de color (selector solo aparece cuando además hay calibre elegido y combinación real)
  const isPrepintada = material === "prepintada";

  // Preview solo si todo es válido
  const preview = useMemo(() => {
    if (!combinacionValida) return null;
    if (isPrepintada && !color) return null;
    if (!pies || cantidad < 1) return null;
    try {
      // Esta función debe tirar si la key real no existe (pero ya chequeamos combinacionValida!)
      const precio = calcChapaPrecio(precios, perfil, material, calibre, Number(pies), cantidad);
      if (
        isNaN(precio.precioUnitarioARS) ||
        isNaN(precio.precioUnitarioUSD) ||
        isNaN(precio.subtotalARS)
      ) return null;
      return precio;
    } catch {
      return null;
    }
  }, [combinacionValida, isPrepintada, color, pies, cantidad, precios, perfil, material, calibre]);

  // Mensaje si la combinación seleccionada (perfil+material+calibre) NO existe en precios
  const noExisteCombinacion =
    perfil && material && calibre && !combinacionValida;

  const resumenPerfilImage =
    perfil && PERFIL_IMAGES[perfil] ? PERFIL_IMAGES[perfil] : "/images/configurador/perfiles/sinusoidal.png";

  // Reseteos según flujo nuevo
  function handleChangePerfil(newPerfil: string) {
    setPerfil(newPerfil);
    setMaterial("");
    setCalibre("");
    setColor("");
    setPies("");
    setError("");
  }
  function handleChangeMaterial(newMaterial: string) {
    setMaterial(newMaterial);
    setCalibre("");
    setColor("");
    setPies("");
    setError("");
  }
  function handleChangeCalibre(newCalibre: string) {
    setCalibre(newCalibre);
    setColor("");
    setPies("");
    setError("");
  }
  function handleChangeColor(newColor: string) {
    setColor(newColor);
    setPies("");
    setError("");
  }
  function handleChangeLargo(newPies: string) {
    setPies(newPies);
    setError("");
  }

  function handleAdd() {
    // Validaciones y mensajes claros (¡mantener!)
    if (!perfil) { setError("Seleccioná el perfil"); return; }
    if (!material) { setError("Seleccioná el material"); return; }
    if (!calibre) { setError("Seleccioná el calibre"); return; }
    if (isPrepintada && !color) { setError("Seleccioná un color"); return; }
    if (!pies) { setError("Seleccioná el largo"); return; }
    if (!combinacionValida) { setError("No existe precio para esta combinación"); return; }
    if (cantidad < 1) { setError("Cantidad mínima: 1"); return; }
    if (cantidad > 300) { setError("Cantidad máxima: 300 unidades"); return; }
    setError("");
    const { precioUnitarioUSD, precioUnitarioARS, subtotalARS } = calcChapaPrecio(
      precios,
      perfil,
      material,
      calibre,
      Number(pies),
      cantidad
    );
    const colorStr = isPrepintada && color ? ` ${color}` : "";
    const desc = `${perfilLabel} ${materialLabel}${colorStr} Cal. ${calibre}`;
    const medida = formatMetros(Number(pies), anchoUtil);
    onAdd({
      tipo: "chapa_perfilada",
      descripcion: desc,
      medida,
      cantidad,
      precioUnitarioUSD,
      precioUnitarioARS,
      subtotalARS,
    });
    alert("Producto agregado a tu cotización");
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50/60">
      <div className="mx-auto max-w-[1450px] px-4 py-4 sm:px-8 sm:py-5">
      <button
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:border-emerald-300 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="mb-2">
        <p className="text-xs font-medium text-gray-400">Inicio &gt; Chapas para Techo</p>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Chapas para Techo</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configurá perfil, material, largo y cantidad para cotizar al instante.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.9fr_1.1fr] lg:items-start">
        {/* IZQUIERDA: Formulario */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            {/* Perfil */}
            <div className="border-b border-slate-100 p-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">Elegí el perfil</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {perfilesDisponibles.map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => handleChangePerfil(p.v)}
                    className={`relative overflow-hidden rounded-xl border bg-white text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                      perfil === p.v
                        ? "border-emerald-500 ring-2 ring-emerald-100 text-gray-900"
                        : "border-gray-200 text-gray-700 hover:border-emerald-300"
                    }`}
                  >
                    {perfil === p.v && (
                      <span className="absolute top-2 right-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                        ✓
                      </span>
                    )}
                    <div className="relative h-32 w-full bg-slate-50">
                      <img
                        src={PERFIL_IMAGES[p.v]}
                        alt={p.label}
                        className="h-full w-full object-cover"
                        style={{ objectPosition: p.v === "sinusoidal" ? "center 78%" : "center 82%" }}
                        loading="lazy"
                        draggable={false}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (next) next.style.display = "flex";
                        }}
                      />
                      <div
                        className="absolute inset-0 hidden items-center justify-center text-xs font-semibold text-gray-500"
                        aria-hidden
                      >
                        Imagen no disponible
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-base font-bold">{p.label}</p>
                      <p className={`mt-1 text-xs ${perfil === p.v ? "text-emerald-700/80" : "text-gray-500"}`}>
                        Perfil para cubierta y cerramientos
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {perfilesDisponibles.length === 0 && (
                <p className="mt-2 text-xs text-gray-400">No hay chapas disponibles.</p>
              )}
            </div>

            {/* Material */}
            {perfil && (
              <div className="border-b border-slate-100 p-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">Elegí el material</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {materialesDisponibles.map((m) => (
                    <button
                      key={m.v}
                      type="button"
                      onClick={() => handleChangeMaterial(m.v)}
                    className={`relative overflow-hidden rounded-xl border bg-white text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                        material === m.v
                        ? "border-emerald-500 ring-2 ring-emerald-100 text-gray-900"
                        : "border-gray-200 text-gray-700 hover:border-emerald-300"
                      }`}
                    >
                      {material === m.v && (
                        <span className="absolute top-2 right-2 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                          ✓
                        </span>
                      )}
                      <div className="relative h-20 w-full bg-slate-50">
                        <img
                          src={MATERIAL_IMAGES[m.v]}
                          alt={m.label}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: m.v === "prepintada" ? "center 40%" : "center 35%" }}
                          loading="lazy"
                          draggable={false}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (next) next.style.display = "flex";
                          }}
                        />
                        <div
                          className="absolute inset-0 hidden items-center justify-center text-xs font-semibold text-gray-500"
                          aria-hidden
                        >
                          Imagen no disponible
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold">{m.label}</p>
                        <p className={`mt-1 text-xs ${material === m.v ? "text-emerald-700/80" : "text-gray-400"}`}>
                          {MATERIAL_DESCS[m.v] || "Material disponible para este perfil."}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {materialesDisponibles.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400">No hay materiales disponibles para este perfil.</p>
                )}
              </div>
            )}

            {/* Calibre */}
            {perfil && material && calibresDisponibles.length > 0 && (
              <div className="border-b border-slate-100 p-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">Seleccioná calibre</p>
                <Chips
                  options={calibresDisponibles.map((c) => ({
                    v: c,
                    label: `Cal. ${c}`,
                  }))}
                  value={calibre}
                  onChange={handleChangeCalibre}
                  disabled={!material}
                />
                <p className="mt-2 text-xs text-slate-500">Cal. 24 = más grueso · Cal. 27 = más liviano</p>
              </div>
            )}
            {perfil && material && calibresDisponibles.length === 0 && (
              <div className="border-b border-slate-100 p-5">
                <p className="text-xs text-gray-400">No hay calibres disponibles para esta combinación.</p>
              </div>
            )}

            {noExisteCombinacion && (
              <div className="border-b border-slate-100 p-5">
                <p className="text-sm font-medium text-red-600">⚠ No existe precio para esta combinación</p>
              </div>
            )}

            {/* Color (prepintada) */}
            {isPrepintada && calibre && combinacionValida && (
              <div className="border-b border-slate-100 p-5">
                <p className="mb-3 text-sm font-semibold text-slate-700">Elegí color</p>
                <div className="flex flex-wrap gap-3">
                  {COLORES_PREPINTADA.map((c) => {
                    const colorKey = c
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "");
                    const bgColor = COLOR_SWATCHES[colorKey] || "#9CA3AF";
                    const selected = color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChangeColor(c)}
                        title={c}
                        aria-label={c}
                        className={`relative h-10 w-10 rounded-full border-2 transition ${
                          selected ? "border-emerald-600 ring-2 ring-emerald-200 shadow-sm" : "border-gray-300 hover:border-gray-500"
                        }`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {selected ? (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Largo */}
            {combinacionValida && (!isPrepintada || color) && (
              <div className="border-b border-slate-100 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">Definí largo</p>
                <Select value={pies} onValueChange={handleChangeLargo}>
                  <SelectTrigger className="rounded-lg border border-gray-200 bg-white text-sm focus:ring-0 focus:border-gray-400">
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
            {combinacionValida && ((!isPrepintada) || (isPrepintada && color)) && pies && (
              <div className="p-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">Cantidad</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gray-200 text-lg font-bold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800"
                  >−</button>
                  <input
                    type="number" min={1} max={300} value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, Math.min(300, Number(e.target.value))))}
                    className="w-20 border-0 bg-transparent text-center text-xl font-bold text-gray-900 focus:outline-none"
                  />
                  <button
                    onClick={() => setCantidad((c) => Math.min(300, c + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-gray-200 text-lg font-bold text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-800"
                  >+</button>
                  <span className="ml-1 text-sm text-gray-400">{cantidad === 1 ? "unidad" : "unidades"}</span>
                </div>
                {cantidad > 50 && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Para pedidos grandes te recomendamos consultar directamente con ventas
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DERECHA: Resumen sticky */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
            <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2">
              <p className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Resumen de cotización</p>
              <p className="text-sm font-semibold text-slate-700">Tu selección en tiempo real</p>
            </div>

            <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              <img
                src={resumenPerfilImage}
                alt={perfilLabel ? `Perfil ${perfilLabel}` : "Perfil de chapa"}
                className="h-36 w-full object-cover"
                style={{ objectPosition: perfil === "trapezoidal" ? "center 82%" : "center 78%" }}
                loading="lazy"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.src = "/images/configurador/perfiles/sinusoidal.png";
                }}
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Perfil</span>
                <span className="text-right font-semibold text-gray-800">{perfilLabel || "—"}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Material</span>
                <span className="text-right font-semibold text-gray-800">
                  {materialLabel ? `${materialLabel}${isPrepintada && color ? ` (${color})` : ""}` : "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Calibre</span>
                <span className="text-right font-semibold text-gray-800">{calibre ? `Cal. ${calibre}` : "—"}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Largo</span>
                <span className="text-right font-semibold text-gray-800">
                  {pies ? `${(Number(pies) * 0.3048).toFixed(2)} mts` : "—"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-gray-500">Cantidad</span>
                <span className="text-right font-semibold text-gray-800">{cantidad} {cantidad === 1 ? "unidad" : "unidades"}</span>
              </div>
            </div>

            <div className="my-4 border-t border-gray-100 pt-4">
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Precio unitario</span>
                <span className="font-semibold text-gray-800">
                  {preview ? formatARS(preview.precioUnitarioARS) : "—"}
                </span>
              </div>
              <div className="mb-2 flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">
                  {preview ? formatARS(preview.subtotalARS) : "—"}
                </span>
              </div>
              {"descuentoARS" in (preview || {}) && (preview as { descuentoARS?: number })?.descuentoARS ? (
                <div className="mb-2 flex justify-between text-sm text-emerald-700">
                  <span>Descuento</span>
                  <span className="font-semibold">
                    - {formatARS((preview as { descuentoARS: number }).descuentoARS)}
                  </span>
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-900">TOTAL FINAL</span>
                <span className="text-2xl font-extrabold text-emerald-700">
                  {preview ? formatARS(preview.subtotalARS) : "—"}
                </span>
              </div>
            </div>

            {error && <p className="mb-3 text-sm font-medium text-red-600">⚠ {error}</p>}

            <button
              onClick={handleAdd}
              disabled={!preview}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white shadow-[0_8px_20px_rgba(0,140,69,0.25)] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: preview ? "#008C45" : "#9ca3af" }}
            >
              <Plus className="h-5 w-5" />
              Agregar al carrito
            </button>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}
