import React, { useEffect, useState, useMemo } from "react";
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

const SINUSOIDAL_MATERIAL_IMAGES: Record<string, string> = {
  galv: "/images/configurador/materiales/sinusoidal-galvanizada.png",
  cincalum: "/images/configurador/materiales/sinusoidal-cincalum.png",
  prepintada: "/images/configurador/materiales/sinusoidal-prepintada.png",
};

function getMaterialImage(perfil: string, material: string): string {
  if (perfil === "sinusoidal" && SINUSOIDAL_MATERIAL_IMAGES[material]) {
    return SINUSOIDAL_MATERIAL_IMAGES[material];
  }

  return MATERIAL_IMAGES[material];
}


const PERFIL_DESCS: Record<string, string> = {
  sinusoidal: "Clásica para techos y cerramientos.",
  trapezoidal: "Mayor rigidez para cubiertas amplias.",
};

const MATERIAL_DESCS: Record<string, string> = {
  galv: "Recubrimiento de zinc, resistente y práctico.",
  cincalum: "Aluminio + zinc, ideal para exterior.",
  prepintada: "Terminación color lista para instalar.",
};

const COLOR_SWATCHES: Record<string, string> = {
  azul: "#1E40AF",
  gris: "#6B7280",
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

function parseKey(key: string) {
  const [perfil, material, calibre] = key.split("_");
  return { perfil, material, calibre };
}

function FallbackImage({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 hidden items-center justify-center bg-slate-50 text-xs font-semibold text-slate-400" aria-hidden>
      {label}
    </div>
  );
}

function SectionTitle({ step, title, description }: { step: string; title: string; description?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">{step}</p>
        <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
    </div>
  );
}

function Chips({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${disabled ? "pointer-events-none opacity-30" : ""}`}>
      {options.map((o) => {
        const selected = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className={`inline-flex min-w-[82px] items-center justify-center rounded-xl border px-4 py-2 text-sm font-black transition-all ${
              selected
                ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_8px_18px_rgba(0,140,69,0.20)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ChapaPerfiladaConfig({
  precios,
  onBack,
  onAdd,
}: {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}) {
  const [perfil, setPerfil] = useState("");
  const [material, setMaterial] = useState("");
  const [calibre, setCalibre] = useState("");
  const [color, setColor] = useState("");
  const [pies, setPies] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const keys = useMemo(() => Object.keys(precios.chapas_perfiladas), [precios]);

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

  const materialesDisponibles = useMemo(() => {
    if (!perfil) return [];
    const found = new Set<string>();
    keys.forEach((k) => {
      const parsed = parseKey(k);
      if (parsed.perfil === perfil && MATERIAL_LABELS[parsed.material]) found.add(parsed.material);
    });
    return Array.from(found).map((m) => ({
      v: m,
      label: MATERIAL_LABELS[m] || m,
    }));
  }, [keys, perfil]);

  const calibresDisponibles = useMemo(() => {
    if (!perfil || !material) return [];
    const found = new Set<string>();
    keys.forEach((k) => {
      const parsed = parseKey(k);
      if (parsed.perfil === perfil && parsed.material === material) found.add(parsed.calibre);
    });
    return Array.from(found).sort((a, b) => Number(a) - Number(b));
  }, [keys, perfil, material]);

  const perfilLabel = perfil && PERFIL_LABELS[perfil] ? PERFIL_LABELS[perfil].label : "";
  const anchoUtil = perfil && PERFIL_LABELS[perfil] ? PERFIL_LABELS[perfil].anchoUtil : 1;
  const materialLabel = material && MATERIAL_LABELS[material] ? MATERIAL_LABELS[material] : "";
  const keyReal = perfil && material && calibre ? `${perfil}_${material}_${calibre}` : "";
  const combinacionValida = keyReal && keys.includes(keyReal);
  const isPrepintada = material === "prepintada";

  const preview = useMemo(() => {
    if (!combinacionValida) return null;
    if (isPrepintada && !color) return null;
    if (!pies || cantidad < 1) return null;
    try {
      const precio = calcChapaPrecio(precios, perfil, material, calibre, Number(pies), cantidad);
      if (isNaN(precio.precioUnitarioARS) || isNaN(precio.precioUnitarioUSD) || isNaN(precio.subtotalARS)) return null;
      return precio;
    } catch {
      return null;
    }
  }, [combinacionValida, isPrepintada, color, pies, cantidad, precios, perfil, material, calibre]);

  const noExisteCombinacion = perfil && material && calibre && !combinacionValida;
  const resumenPerfilImage = perfil && PERFIL_IMAGES[perfil] ? PERFIL_IMAGES[perfil] : "/images/configurador/perfiles/sinusoidal.png";

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

  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7faf9_100%)]">
      <div className="mx-auto max-w-[1320px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
        </div>

        <section className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.06)]">
          <div className="grid items-stretch lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative p-6 sm:p-8">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.20em] text-emerald-700">Inicio / Chapas para Techo</p>
              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Configurá tu chapa</h2>
              <p className="mt-3 max-w-xl text-base font-medium leading-7 text-slate-600">
                Elegí perfil, material, largo y cantidad. El resumen se actualiza al instante antes de agregar al carrito.
              </p>
            </div>
            <div className="relative hidden min-h-[190px] overflow-hidden bg-slate-950 lg:block">
              <img
                src={resumenPerfilImage}
                alt={perfilLabel ? `Perfil ${perfilLabel}` : "Chapa para techo"}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                style={{ objectPosition: perfil === "trapezoidal" ? "center 78%" : "center 76%" }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/50 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-bold text-emerald-300">{perfilLabel || "Seleccioná un perfil"}</p>
                <p className="mt-1 text-xs text-white/70">Producto a medida para tu obra</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <main className="space-y-6">
            <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.045)] sm:p-5">
              <SectionTitle step="01" title="Elegí el perfil" description="La forma define el uso y la estética de la cubierta." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {perfilesDisponibles.map((p) => {
                  const selected = perfil === p.v;
                  return (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => handleChangePerfil(p.v)}
                      className={`group relative overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
                        selected ? "border-emerald-500 shadow-[0_18px_44px_rgba(0,140,69,0.11)] ring-4 ring-emerald-50" : "border-slate-200 hover:border-emerald-200"
                      }`}
                    >
                      <div className="relative h-44 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                        <img
                          src={PERFIL_IMAGES[p.v]}
                          alt={p.label}
                          className="h-full w-full object-contain px-5 pt-3 transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ objectPosition: p.v === "sinusoidal" ? "center 82%" : "center 84%" }}
                          loading="lazy"
                          draggable={false}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                            if (next) next.style.display = "flex";
                          }}
                        />
                        <FallbackImage label="Imagen no disponible" />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/85 to-transparent" />
                      </div>
                      <div className="relative px-5 pb-5 pt-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xl font-black tracking-tight text-slate-950">{p.label}</p>
                            <p className="mt-1 text-sm leading-5 text-slate-500">{PERFIL_DESCS[p.v] || "Perfil disponible para cotizar."}</p>
                          </div>
                          <span
                            className={`mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-black ${
                              selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {perfilesDisponibles.length === 0 ? <p className="mt-3 text-sm text-slate-500">No hay chapas disponibles.</p> : null}
            </section>

            {perfil ? (
              <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.045)] sm:p-5">
                <SectionTitle step="02" title="Elegí el material" description="La terminación define durabilidad, color y uso recomendado." />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {materialesDisponibles.map((m) => {
                    const selected = material === m.v;
                    return (
                      <button
                        key={m.v}
                        type="button"
                        onClick={() => handleChangeMaterial(m.v)}
                        className={`group relative overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
                          selected ? "border-emerald-500 shadow-[0_18px_44px_rgba(0,140,69,0.10)] ring-4 ring-emerald-50" : "border-slate-200 hover:border-emerald-200"
                        }`}
                      >
                        <div className="relative h-32 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                          <img
                            src={getMaterialImage(perfil, m.v)}
                            alt={m.label}
                            className="h-full w-full object-contain px-7 py-4 transition-transform duration-300 group-hover:scale-[1.015]"
                            style={{ objectPosition: "center center" }}
                            loading="lazy"
                            draggable={false}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (next) next.style.display = "flex";
                            }}
                          />
                          <FallbackImage label="Imagen no disponible" />
                        </div>
                        <div className="px-4 pb-4 pt-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-base font-black text-slate-950">{m.label}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{MATERIAL_DESCS[m.v] || "Material disponible para este perfil."}</p>
                            </div>
                            <span
                              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                                selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {materialesDisponibles.length === 0 ? <p className="mt-3 text-sm text-slate-500">No hay materiales disponibles para este perfil.</p> : null}
              </section>
            ) : null}

            {perfil && material && calibresDisponibles.length > 0 ? (
              <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.045)] sm:p-5">
                <SectionTitle step="03" title="Seleccioná calibre" description="El calibre varía según perfil y material elegido." />
                <Chips
                  options={calibresDisponibles.map((c) => ({ v: c, label: `Cal. ${c}` }))}
                  value={calibre}
                  onChange={handleChangeCalibre}
                  disabled={!material}
                />
                <p className="mt-3 text-sm text-slate-500">Cal. 24 = más grueso · Cal. 27 = más liviano</p>
              </section>
            ) : null}

            {perfil && material && calibresDisponibles.length === 0 ? (
              <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">No hay calibres disponibles para esta combinación.</p>
              </section>
            ) : null}

            {noExisteCombinacion ? (
              <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                No existe precio para esta combinación.
              </section>
            ) : null}

            {isPrepintada && calibre && combinacionValida ? (
              <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.045)] sm:p-5">
                <SectionTitle step="04" title="Elegí color" description="La imagen es referencial; el color se define acá." />
                <div className="flex flex-wrap gap-3">
                  {COLORES_PREPINTADA.map((c) => {
                    const colorKey = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const bgColor = COLOR_SWATCHES[colorKey] || "#9CA3AF";
                    const selected = color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChangeColor(c)}
                        title={c}
                        aria-label={c}
                        className={`relative h-11 w-11 rounded-full border-2 transition-all hover:scale-105 ${
                          selected ? "border-emerald-700 ring-4 ring-emerald-100" : "border-white shadow-[0_0_0_1px_rgba(15,23,42,0.12)]"
                        }`}
                        style={{ backgroundColor: bgColor }}
                      >
                        {selected ? <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">✓</span> : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {combinacionValida && (!isPrepintada || color) ? (
              <section className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.045)] sm:p-5">
                <SectionTitle step="05" title="Definí largo y cantidad" description="Seleccioná la medida disponible y cuántas unidades necesitás." />
                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-800">Largo</label>
                    <Select value={pies} onValueChange={handleChangeLargo}>
                      <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 focus:border-emerald-400 focus:ring-0">
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

                  {pies ? (
                    <div>
                      <label className="mb-2 block text-sm font-black text-slate-800">Cantidad</label>
                      <div className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-3">
                        <button
                          type="button"
                          onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={300}
                          value={cantidad}
                          onChange={(e) => setCantidad(Math.max(1, Math.min(300, Number(e.target.value))))}
                          className="w-20 border-0 bg-transparent text-center text-xl font-black text-slate-950 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCantidad((c) => Math.min(300, c + 1))}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-lg font-black text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                          +
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-medium text-slate-400">{cantidad === 1 ? "1 unidad" : `${cantidad} unidades`}</p>
                    </div>
                  ) : null}
                </div>
                {cantidad > 50 ? (
                  <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                    Para pedidos grandes te recomendamos consultar directamente con ventas.
                  </p>
                ) : null}
              </section>
            ) : null}
          </main>

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
              <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Resumen de cotización</p>
                <p className="mt-1 text-sm font-semibold text-slate-600">Tu selección en tiempo real</p>
              </div>

              <div className="p-5">
                <div className="mb-5 overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                  <img
                    src={resumenPerfilImage}
                    alt={perfilLabel ? `Perfil ${perfilLabel}` : "Perfil de chapa"}
                    className="h-40 w-full object-contain px-7 py-3"
                    style={{ objectPosition: perfil === "trapezoidal" ? "center 84%" : "center 82%" }}
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.src = "/images/configurador/perfiles/sinusoidal.png";
                    }}
                  />
                </div>

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500">Perfil</span>
                    <span className="text-right font-black text-slate-900">{perfilLabel || "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500">Material</span>
                    <span className="text-right font-black text-slate-900">
                      {materialLabel ? `${materialLabel}${isPrepintada && color ? ` (${color})` : ""}` : "—"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500">Calibre</span>
                    <span className="text-right font-black text-slate-900">{calibre ? `Cal. ${calibre}` : "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500">Largo</span>
                    <span className="text-right font-black text-slate-900">{pies ? `${(Number(pies) * 0.3048).toFixed(2)} mts` : "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-slate-500">Cantidad</span>
                    <span className="text-right font-black text-slate-900">{cantidad} {cantidad === 1 ? "unidad" : "unidades"}</span>
                  </div>
                </div>

                <div className="my-5 border-t border-slate-100 pt-5">
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Precio unitario</span>
                    <span className="font-black text-slate-900">{preview ? formatARS(preview.precioUnitarioARS) : "—"}</span>
                  </div>
                  <div className="mb-2 flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-black text-slate-900">{preview ? formatARS(preview.subtotalARS) : "—"}</span>
                  </div>
                  {"descuentoARS" in (preview || {}) && (preview as { descuentoARS?: number })?.descuentoARS ? (
                    <div className="mb-2 flex justify-between text-sm text-emerald-700">
                      <span>Descuento</span>
                      <span className="font-black">- {formatARS((preview as { descuentoARS: number }).descuentoARS)}</span>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-3xl bg-emerald-700 px-5 py-4 text-white shadow-[0_18px_38px_rgba(0,140,69,0.25)]">
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-sm font-black uppercase tracking-wide text-white/85">Total final</span>
                    <span className="text-2xl font-black tracking-tight">{preview ? formatARS(preview.subtotalARS) : "—"}</span>
                  </div>
                </div>

                {error ? <p className="mt-4 text-sm font-bold text-red-600">⚠ {error}</p> : null}

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!preview}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-[0_12px_24px_rgba(0,140,69,0.22)] transition-all hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
                  style={{ background: preview ? "#008C45" : "#9ca3af" }}
                >
                  <Plus className="h-5 w-5" />
                  Agregar al carrito
                </button>

                <p className="mt-3 text-center text-xs font-semibold text-slate-400">
                  Podés modificar tu carrito antes de confirmar.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
