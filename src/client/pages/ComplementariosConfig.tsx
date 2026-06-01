import React, { useEffect, useMemo, useState } from "react";
import {
  Precios,
  CartItem,
  calcComplementarioPrecio,
  formatARS,
} from "@/lib/precios";
import { ArrowLeft, ShoppingCart } from "lucide-react";

// Imagen en el sidebar derecho (misma lógica que PerfilCConfig)
function SidebarImg({ src }: { src: string | null }) {
  const [failed, setFailed] = React.useState(false);
  // Resetear si cambia la imagen
  React.useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return null;
  return (
    <div className="h-44 w-full overflow-hidden bg-slate-50">
      <img
        src={src}
        alt="Imagen del producto"
        className="h-full w-full object-cover object-center"
        loading="lazy"
        draggable={false}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
  initialSubcategoria?: Subcategoria;
}

type Subcategoria = "cumbreras" | "autoperforantes" | "tornillos" | "estaño";
type CumbrerasTipo = "sinusoidal" | "trapezoidal" | "lisa";
type ListaDesarrollo = "40" | "60";

const SUBCATEGORIA_LABELS: Record<Subcategoria, string> = {
  cumbreras: "Cumbreras",
  autoperforantes: "Autoperforantes",
  tornillos: "Tornillos",
  estaño: "Estaño",
};

// Colores lisas con hex para swatches
const COLORES_LISA = ["azul", "gris", "negra", "roja", "verde", "sin_pintar"] as const;
const COLOR_DISPLAY: Record<string, string> = {
  azul: "Azul",
  gris: "Gris",
  negra: "Negra",
  roja: "Roja",
  verde: "Verde",
  sin_pintar: "Sin pintar",
};
const COLOR_HEX: Record<string, string> = {
  azul: "#1d4ed8",
  gris: "#6b7280",
  negra: "#111827",
  roja: "#dc2626",
  verde: "#15803d",
  sin_pintar: "#94a3b8",
};

// Autoperforantes: separados por tipo de rosca
const AUTO_ROSCA_OPTIONS = ["chapa", "madera"] as const;
type AutoRosca = typeof AUTO_ROSCA_OPTIONS[number];

const AUTO_ROSCA_LABEL: Record<AutoRosca, string> = {
  chapa: "Rosca Chapa",
  madera: "Rosca Madera",
};

// Medidas de autoperforantes por rosca
const AUTO_MEDIDAS: Record<AutoRosca, string[]> = {
  chapa: ["1", "1.5", "2", "2.5"],
  madera: ["2", "2.5", "3"],
};

// Tornillos: separados por punta
const TORNILLO_PUNTA_OPTIONS = ["aguja", "mecha"] as const;
type TornilloPunta = typeof TORNILLO_PUNTA_OPTIONS[number];

const TORNILLO_PUNTA_LABEL: Record<TornilloPunta, string> = {
  aguja: "Punta Aguja",
  mecha: "Punta Mecha",
};

const TORNILLO_MODELOS: Record<TornilloPunta, string[]> = {
  aguja: ["T1", "T2", "T3", "T4"],
  mecha: ["T1", "T2", "T3"],
};

// Clampea bolsas a [0.5, 8] con 1 decimal — permite paso 0.1
function normalizeBolsas(val: string): string {
  const n = parseFloat(val.replace(",", "."));
  if (!isFinite(n) || n < 0.5) return "0.5";
  if (n > 8) return "8";
  return String(Math.round(n * 10) / 10);
}

function OptionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition-all ${
        active
          ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40"
      }`}
    >
      {children}
    </button>
  );
}

function SectionCard({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-slate-200 bg-white/95 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-800">
          {step}
        </span>
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
          <p className="mt-1 text-sm font-medium leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-900">{value}</span>
    </div>
  );
}

export default function ComplementariosConfig({ precios, onBack, onAdd, initialSubcategoria }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [subcategoria, setSubcategoria] = useState<Subcategoria | "">(initialSubcategoria ?? "");

  // Cumbreras
  const [cumbrerasTipo, setCumbrerasTipo] = useState<CumbrerasTipo | "">("");
  const [lisaDesarrollo, setLisaDesarrollo] = useState<ListaDesarrollo | "">("");
  const [lisaColor, setLisaColor] = useState<string>("");
  const [metrosStr, setMetrosStr] = useState<string>("");

  // Autoperforantes
  const [autoRosca, setAutoRosca] = useState<AutoRosca | "">("");
  const [autoMedida, setAutoMedida] = useState<string>("");

  // Tornillos
  const [tornilloPunta, setTornilloPunta] = useState<TornilloPunta | "">("");
  const [tornilloModelo, setTornilloModelo] = useState<string>("");

  // Shared bolsas
  const [bolsas, setBolsas] = useState<string>("1");

  // Estaño
  const [estanoKey, setEstanoKey] = useState<string>("");
  const [estanoCantidad, setEstanoCantidad] = useState<number>(1);

  const [error, setError] = useState<string>("");

  function resetSubState() {
    setCumbrerasTipo("");
    setLisaDesarrollo("");
    setLisaColor("");
    setMetrosStr("");
    setAutoRosca("");
    setAutoMedida("");
    setTornilloPunta("");
    setTornilloModelo("");
    setBolsas("1");
    setEstanoKey("");
    setEstanoCantidad(1);
    setError("");
  }

  // Imagen dinámica del sidebar según selección
  const sidebarImage = useMemo((): string | null => {
    if (subcategoria === "cumbreras") {
      if (cumbrerasTipo === "sinusoidal") return "/images/productos/cumbrera-sinusoidal.webp";
      if (cumbrerasTipo === "trapezoidal") return "/images/productos/cumbrera-trapezoidal.webp";
      if (cumbrerasTipo === "lisa") return "/images/productos/cumbrera-lisa.webp";
      return "/images/productos/cumbrera-sinusoidal.webp";
    }
    if (subcategoria === "autoperforantes") return "/images/productos/autoperforantes.webp";
    if (subcategoria === "tornillos") {
      if (tornilloPunta === "mecha") return "/images/productos/tornillos-mecha.webp";
      return "/images/productos/tornillos-aguja.webp";
    }
    if (subcategoria === "estaño") return "/images/productos/estano.webp";
    return null;
  }, [subcategoria, cumbrerasTipo, tornilloPunta]);

  // Keys derivados
  const cumbrerasKey = useMemo(() => {
    if (cumbrerasTipo === "sinusoidal") return "sinusoidal_negra";
    if (cumbrerasTipo === "trapezoidal") return "trapezoidal_negra";
    if (cumbrerasTipo === "lisa" && lisaDesarrollo && lisaColor) {
      return `lisa_${lisaColor}_${lisaDesarrollo}`;
    }
    return "";
  }, [cumbrerasTipo, lisaDesarrollo, lisaColor]);

  const autoKey = useMemo(() => {
    if (!autoRosca || !autoMedida) return "";
    return `${autoMedida}_rosca_${autoRosca}`;
  }, [autoRosca, autoMedida]);

  const tornilloKey = useMemo(() => {
    if (!tornilloPunta || !tornilloModelo) return "";
    return `${tornilloModelo}_punta_${tornilloPunta}`;
  }, [tornilloPunta, tornilloModelo]);

  // Metros siempre enteros ≥ 1
  const metros = useMemo(() => {
    const n = parseInt(metrosStr.trim(), 10);
    return isFinite(n) && n >= 1 ? n : null;
  }, [metrosStr]);

  const preview = useMemo(() => {
    if (!subcategoria) return null;

    if (subcategoria === "cumbreras") {
      if (!cumbrerasKey || metros === null) return null;
      return calcComplementarioPrecio(precios, "cumbreras", cumbrerasKey, metros);
    }

    if (subcategoria === "autoperforantes") {
      if (!autoKey) return null;
      const n = parseFloat(bolsas.replace(",", "."));
      if (!isFinite(n) || n < 0.5) return null;
      return calcComplementarioPrecio(precios, "autoperforantes", autoKey, n);
    }

    if (subcategoria === "tornillos") {
      if (!tornilloKey) return null;
      const n = parseFloat(bolsas.replace(",", "."));
      if (!isFinite(n) || n < 0.5) return null;
      return calcComplementarioPrecio(precios, "tornillos", tornilloKey, n);
    }

    if (subcategoria === "estaño") {
      if (!estanoKey || estanoCantidad < 1) return null;
      return calcComplementarioPrecio(precios, "estaño", estanoKey, estanoCantidad);
    }

    return null;
  }, [subcategoria, cumbrerasKey, metros, autoKey, tornilloKey, bolsas, estanoKey, estanoCantidad, precios]);

  function handleAdd() {
    if (!subcategoria) { setError("Seleccioná una categoría"); return; }

    if (subcategoria === "cumbreras") {
      if (!cumbrerasTipo) { setError("Seleccioná el tipo de cumbrera"); return; }
      if (cumbrerasTipo === "lisa") {
        if (!lisaDesarrollo) { setError("Seleccioná el desarrollo"); return; }
        if (!lisaColor) { setError("Seleccioná el color"); return; }
      }
      if (metros === null) { setError("Ingresá la cantidad de metros"); return; }
      if (!preview) return;

      const tipoLabel =
        cumbrerasTipo === "sinusoidal"
          ? "Sinusoidal Negra 0.6"
          : cumbrerasTipo === "trapezoidal"
          ? "Trapezoidal Negra 0.6"
          : `Lisa ${COLOR_DISPLAY[lisaColor] ?? lisaColor} des. ${lisaDesarrollo}`;

      onAdd({
        tipo: "complementario",
        descripcion: `Cumbrera ${tipoLabel}`,
        medida: `${metros.toFixed(2)} metro${metros === 1 ? "" : "s"}`,
        cantidad: metros,
        precioUnitarioUSD: preview.precioUnitarioUSD,
        precioUnitarioARS: preview.precioUnitarioARS,
        subtotalARS: preview.subtotalARS,
      });
      return;
    }

    if (subcategoria === "autoperforantes") {
      if (!autoRosca) { setError("Seleccioná el tipo de rosca"); return; }
      if (!autoMedida) { setError("Seleccioná la medida"); return; }
      const bolsasNum = parseFloat(bolsas.replace(",", "."));
      if (!isFinite(bolsasNum) || bolsasNum < 0.5) { setError("Mínimo 0.5 bolsas"); return; }
      if (!preview) return;
      onAdd({
        tipo: "complementario",
        descripcion: `Autoperforante ${autoMedida}" ${AUTO_ROSCA_LABEL[autoRosca]} × 100 uds`,
        medida: "bolsa × 100 uds",
        cantidad: bolsasNum,
        precioUnitarioUSD: 0,
        precioUnitarioARS: preview.precioUnitarioARS,
        subtotalARS: preview.subtotalARS,
      });
      return;
    }

    if (subcategoria === "tornillos") {
      if (!tornilloPunta) { setError("Seleccioná el tipo de punta"); return; }
      if (!tornilloModelo) { setError("Seleccioná el modelo"); return; }
      const bolsasNum = parseFloat(bolsas.replace(",", "."));
      if (!isFinite(bolsasNum) || bolsasNum < 0.5) { setError("Mínimo 0.5 bolsas"); return; }
      if (!preview) return;
      onAdd({
        tipo: "complementario",
        descripcion: `Tornillo ${tornilloModelo} ${TORNILLO_PUNTA_LABEL[tornilloPunta]} × 100 uds`,
        medida: "bolsa × 100 uds",
        cantidad: bolsasNum,
        precioUnitarioUSD: 0,
        precioUnitarioARS: preview.precioUnitarioARS,
        subtotalARS: preview.subtotalARS,
      });
      return;
    }

    if (subcategoria === "estaño") {
      if (!estanoKey) { setError("Seleccioná la presentación"); return; }
      if (estanoCantidad < 1) { setError("La cantidad debe ser al menos 1"); return; }
      if (!preview) return;
      const estanoLabel = estanoKey === "kg" ? "Estaño 50% — paquete 8 barras (≈1070g)" : "Estaño 50% — barra individual (133g)";
      onAdd({
        tipo: "complementario",
        descripcion: estanoLabel,
        medida: estanoKey === "kg" ? "paquete × 8 barras" : "barra individual",
        cantidad: estanoCantidad,
        precioUnitarioUSD: 0,
        precioUnitarioARS: preview.precioUnitarioARS,
        subtotalARS: preview.subtotalARS,
      });
    }
  }

  // Resumen label helpers
  const previewLabel = useMemo(() => {
    if (subcategoria === "cumbreras" && cumbrerasTipo) {
      if (cumbrerasTipo === "sinusoidal") return "Sinusoidal Negra 0.6";
      if (cumbrerasTipo === "trapezoidal") return "Trapezoidal Negra 0.6";
      if (lisaColor && lisaDesarrollo)
        return `Lisa ${COLOR_DISPLAY[lisaColor]} des. ${lisaDesarrollo}`;
    }
    if (subcategoria === "autoperforantes" && autoRosca && autoMedida)
      return `${autoMedida}" ${AUTO_ROSCA_LABEL[autoRosca]}`;
    if (subcategoria === "tornillos" && tornilloPunta && tornilloModelo)
      return `${tornilloModelo} ${TORNILLO_PUNTA_LABEL[tornilloPunta]}`;
    if (subcategoria === "estaño" && estanoKey)
      return estanoKey === "kg" ? "KG (paquete)" : "Barra individual";
    return null;
  }, [subcategoria, cumbrerasTipo, lisaColor, lisaDesarrollo, autoRosca, autoMedida, tornilloPunta, tornilloModelo, estanoKey]);

  // Step para cantidad en auto/tornillos
  const bolsasStep = subcategoria === "autoperforantes" || subcategoria === "tornillos"
    ? (subcategoria === "autoperforantes" ? (autoRosca ? "03" : "—") : (tornilloPunta ? "03" : "—"))
    : "—";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.13),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#ffffff_48%,#f7faf9_100%)] px-4 py-5 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <button
          onClick={onBack}
          type="button"
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="mb-6 overflow-hidden rounded-[30px] border border-amber-100 bg-[linear-gradient(135deg,#ffffff_0%,#fffbf0_48%,#fef3c7_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="relative px-6 py-7 text-center sm:px-10 lg:px-12 lg:py-8">
            <div className="relative mx-auto max-w-3xl">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-amber-700">Inicio / Complementarios</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Complementarios</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                Cumbreras, autoperforantes, tornillos y estaño para completar tu obra.
              </p>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]">
          <div className="space-y-5">

            {/* PASO 01 — Categoría */}
            <SectionCard
              step="01"
              title="Categoría"
              description="Elegí el tipo de complementario que necesitás."
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["cumbreras", "autoperforantes", "tornillos", "estaño"] as Subcategoria[]).map((cat) => (
                  <OptionButton
                    key={cat}
                    active={subcategoria === cat}
                    onClick={() => {
                      setSubcategoria(cat);
                      resetSubState();
                    }}
                  >
                    <span className="block">{SUBCATEGORIA_LABELS[cat]}</span>
                  </OptionButton>
                ))}
              </div>
            </SectionCard>

            {/* ══════════ CUMBRERAS ══════════ */}
            {subcategoria === "cumbreras" && (
              <SectionCard
                step="02"
                title="Tipo de cumbrera"
                description="Seleccioná el perfil de la cumbrera."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <OptionButton
                    active={cumbrerasTipo === "sinusoidal"}
                    onClick={() => { setCumbrerasTipo("sinusoidal"); setLisaDesarrollo(""); setLisaColor(""); setMetrosStr(""); setError(""); }}
                  >
                    <span className="block font-black">Sinusoidal</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">Negra — 60 cm totales · 30 cm por lado</span>
                  </OptionButton>
                  <OptionButton
                    active={cumbrerasTipo === "trapezoidal"}
                    onClick={() => { setCumbrerasTipo("trapezoidal"); setLisaDesarrollo(""); setLisaColor(""); setMetrosStr(""); setError(""); }}
                  >
                    <span className="block font-black">Trapezoidal</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">Negra — 60 cm totales · 30 cm por lado</span>
                  </OptionButton>
                  <OptionButton
                    active={cumbrerasTipo === "lisa"}
                    onClick={() => { setCumbrerasTipo("lisa"); setLisaDesarrollo(""); setLisaColor(""); setMetrosStr(""); setError(""); }}
                  >
                    <span className="block font-black">Lisa</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">Varios colores</span>
                  </OptionButton>
                </div>
              </SectionCard>
            )}

            {/* Desarrollo (Lisa) */}
            {subcategoria === "cumbreras" && cumbrerasTipo === "lisa" && (
              <SectionCard
                step="03"
                title="Desarrollo"
                description="Ancho total de la cumbrera al desplegarla."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <OptionButton
                    active={lisaDesarrollo === "40"}
                    onClick={() => { setLisaDesarrollo("40"); setLisaColor(""); setMetrosStr(""); setError(""); }}
                  >
                    <span className="block text-lg font-black">40 cm</span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">20 cm por lado</span>
                  </OptionButton>
                  <OptionButton
                    active={lisaDesarrollo === "60"}
                    onClick={() => { setLisaDesarrollo("60"); setLisaColor(""); setMetrosStr(""); setError(""); }}
                  >
                    <span className="block text-lg font-black">60 cm</span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">30 cm por lado</span>
                  </OptionButton>
                </div>
              </SectionCard>
            )}

            {/* Color (Lisa con desarrollo) */}
            {subcategoria === "cumbreras" && cumbrerasTipo === "lisa" && lisaDesarrollo && (
              <SectionCard
                step="04"
                title="Color"
                description="Elegí el color de la cumbrera lisa."
              >
                <div className="flex flex-wrap gap-4">
                  {COLORES_LISA.map((c) => {
                    const selected = lisaColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { setLisaColor(c); setMetrosStr(""); setError(""); }}
                        className="flex flex-col items-center gap-1.5 focus:outline-none"
                      >
                        <span
                          className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-105 ${
                            selected
                              ? "ring-2 ring-emerald-600 ring-offset-2"
                              : "ring-1 ring-slate-200 ring-offset-1"
                          }`}
                          style={{ backgroundColor: COLOR_HEX[c] }}
                        >
                          {selected && (
                            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className={`text-[11px] font-semibold leading-none ${selected ? "text-emerald-700" : "text-slate-500"}`}>
                          {COLOR_DISPLAY[c]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            {/* Metros (Cumbreras) */}
            {subcategoria === "cumbreras" &&
              cumbrerasTipo &&
              (cumbrerasTipo !== "lisa" || (lisaDesarrollo && lisaColor)) && (
                <SectionCard
                  step={cumbrerasTipo === "lisa" ? "05" : "03"}
                  title="Metros"
                  description="Ingresá la cantidad de metros de cumbrera."
                >
                  <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 max-w-xs">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={metrosStr}
                      min="1"
                      step="1"
                      onChange={(e) => {
                        // Solo enteros ≥ 1
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setMetrosStr(v);
                        setError("");
                      }}
                      placeholder="Ej: 6"
                      className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl font-black text-slate-950 outline-none"
                    />
                    <span className="border-l border-slate-200 px-4 text-sm font-black text-slate-500">metros</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-400">Solo metros enteros (1, 2, 3…).</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[2, 4, 6, 8, 10, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMetrosStr(String(m))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        {m} m
                      </button>
                    ))}
                  </div>
                </SectionCard>
              )}

            {/* ══════════ AUTOPERFORANTES ══════════ */}

            {/* Tipo rosca */}
            {subcategoria === "autoperforantes" && (
              <SectionCard
                step="02"
                title="Tipo de rosca"
                description="Elegí entre rosca para chapa o rosca para madera."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {AUTO_ROSCA_OPTIONS.map((r) => (
                    <OptionButton
                      key={r}
                      active={autoRosca === r}
                      onClick={() => { setAutoRosca(r); setAutoMedida(""); setBolsas("1"); setError(""); }}
                    >
                      <span className="block font-black">{AUTO_ROSCA_LABEL[r]}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Medida autoperforante */}
            {subcategoria === "autoperforantes" && autoRosca && (
              <SectionCard
                step="03"
                title="Medida"
                description={`Autoperforantes ${AUTO_ROSCA_LABEL[autoRosca]} — elegí la medida en pulgadas.`}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {AUTO_MEDIDAS[autoRosca].map((m) => (
                    <OptionButton
                      key={m}
                      active={autoMedida === m}
                      onClick={() => { setAutoMedida(m); setBolsas("1"); setError(""); }}
                    >
                      <span className="block text-lg font-black">{m}"</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Cantidad autoperforantes */}
            {subcategoria === "autoperforantes" && autoRosca && autoMedida && (
              <SectionCard
                step="04"
                title="Cantidad (bolsas)"
                description="Cada bolsa contiene 100 unidades. Mínimo: 0.5 bolsa = 50 autoperforantes."
              >
                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 max-w-xs">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={bolsas}
                    min="0.5"
                    max="8"
                    step="0.1"
                    onChange={(e) => { setBolsas(e.target.value); setError(""); }}
                    onBlur={(e) => setBolsas(normalizeBolsas(e.target.value))}
                    className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl font-black text-slate-950 outline-none"
                  />
                  <span className="border-l border-slate-200 px-4 text-sm font-black text-slate-500">bolsas</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[0.5, 1, 2, 3, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setBolsas(String(n))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {n} bolsa{n !== 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ══════════ TORNILLOS ══════════ */}

            {/* Tipo punta */}
            {subcategoria === "tornillos" && (
              <SectionCard
                step="02"
                title="Tipo de punta"
                description="Elegí entre punta aguja o punta mecha."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {TORNILLO_PUNTA_OPTIONS.map((p) => (
                    <OptionButton
                      key={p}
                      active={tornilloPunta === p}
                      onClick={() => { setTornilloPunta(p); setTornilloModelo(""); setBolsas("1"); setError(""); }}
                    >
                      <span className="block font-black">{TORNILLO_PUNTA_LABEL[p]}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Modelo tornillo */}
            {subcategoria === "tornillos" && tornilloPunta && (
              <SectionCard
                step="03"
                title="Modelo"
                description={`Tornillos ${TORNILLO_PUNTA_LABEL[tornilloPunta]} — elegí el modelo.`}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {TORNILLO_MODELOS[tornilloPunta].map((m) => (
                    <OptionButton
                      key={m}
                      active={tornilloModelo === m}
                      onClick={() => { setTornilloModelo(m); setBolsas("1"); setError(""); }}
                    >
                      <span className="block text-lg font-black">{m}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Cantidad tornillos */}
            {subcategoria === "tornillos" && tornilloPunta && tornilloModelo && (
              <SectionCard
                step="04"
                title="Cantidad (bolsas)"
                description="Cada bolsa contiene 100 unidades. Mínimo: 0.5 bolsa = 50 tornillos."
              >
                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 max-w-xs">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={bolsas}
                    min="0.5"
                    max="8"
                    step="0.1"
                    onChange={(e) => { setBolsas(e.target.value); setError(""); }}
                    onBlur={(e) => setBolsas(normalizeBolsas(e.target.value))}
                    className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl font-black text-slate-950 outline-none"
                  />
                  <span className="border-l border-slate-200 px-4 text-sm font-black text-slate-500">bolsas</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[0.5, 1, 2, 3, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setBolsas(String(n))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {n} bolsa{n !== 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ══════════ ESTAÑO ══════════ */}
            {subcategoria === "estaño" && (
              <SectionCard
                step="02"
                title="Presentación"
                description="El estaño se vende por barra individual o en paquetes de 8 barras (≈ 1 kg)."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <OptionButton
                    active={estanoKey === "kg"}
                    onClick={() => { setEstanoKey("kg"); setEstanoCantidad(1); setError(""); }}
                  >
                    <span className="block text-base font-black">KG — paquete</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">8 barras ≈ 1070 g</span>
                  </OptionButton>
                  <OptionButton
                    active={estanoKey === "barra"}
                    onClick={() => { setEstanoKey("barra"); setEstanoCantidad(1); setError(""); }}
                  >
                    <span className="block text-base font-black">Barra individual</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">1 barra ≈ 133 g</span>
                  </OptionButton>
                </div>
              </SectionCard>
            )}

            {subcategoria === "estaño" && estanoKey && (
              <SectionCard
                step="03"
                title="Cantidad"
                description={estanoKey === "kg" ? "¿Cuántos paquetes (KG) necesitás?" : "¿Cuántas barras necesitás?"}
              >
                {/* Aviso: 8 barras = paquete cerrado */}
                {estanoKey === "barra" && estanoCantidad === 8 && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                    <span className="font-black">Tip:</span> 8 barras equivale a 1 kg (paquete cerrado). Te recomendamos comprar el paquete: es más económico.
                  </div>
                )}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-xs">
                  <button
                    type="button"
                    onClick={() => setEstanoCantidad((p) => Math.max(1, p - 1))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <div className="text-3xl font-black text-slate-950">{estanoCantidad}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {estanoKey === "kg"
                        ? "paquete" + (estanoCantidad !== 1 ? "s" : "")
                        : "barra" + (estanoCantidad !== 1 ? "s" : "")}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEstanoCantidad((p) => p + 1)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    +
                  </button>
                </div>
              </SectionCard>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* RESUMEN */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
              {/* Imagen dinámica según subcategoría/tipo seleccionado */}
              <SidebarImg src={sidebarImage} />
              <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-800">Resumen de cotización</p>
                <p className="mt-1 text-sm font-extrabold text-slate-600">Tu selección en tiempo real</p>
              </div>

              <div className="p-5">
                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow
                    label="Categoría"
                    value={subcategoria ? SUBCATEGORIA_LABELS[subcategoria] : "—"}
                  />
                  {previewLabel && (
                    <SummaryRow label="Producto" value={previewLabel} />
                  )}
                  {subcategoria === "cumbreras" && metros !== null && (
                    <SummaryRow label="Metros" value={`${metros.toFixed(2)} m`} />
                  )}
                  {(subcategoria === "autoperforantes" || subcategoria === "tornillos") &&
                    parseFloat(bolsas) >= 0.5 && (
                      <SummaryRow
                        label="Bolsas"
                        value={`${bolsas} × 100 uds`}
                      />
                    )}
                  {subcategoria === "estaño" && estanoKey && (
                    <SummaryRow
                      label="Cantidad"
                      value={`${estanoCantidad} ${
                        estanoKey === "kg"
                          ? "paquete" + (estanoCantidad !== 1 ? "s" : "")
                          : "barra" + (estanoCantidad !== 1 ? "s" : "")
                      }`}
                    />
                  )}
                </div>

                <div className="mt-4 space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow
                    label="Precio unitario"
                    value={preview ? formatARS(preview.precioUnitarioARS) : "—"}
                  />
                  <SummaryRow
                    label="Total"
                    value={preview ? formatARS(preview.subtotalARS) : "—"}
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-emerald-700 px-4 py-4 text-white shadow-lg shadow-emerald-800/20">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black uppercase tracking-wide">Total final</span>
                    <span className="text-2xl font-black tracking-tight">
                      {preview ? formatARS(preview.subtotalARS) : "—"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!preview}
                  type="button"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-4 text-base font-black text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Agregar al carrito
                </button>

                {!preview && (
                  <p className="mt-4 text-center text-xs font-extrabold text-slate-400">
                    Completá la selección para habilitar el botón.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
