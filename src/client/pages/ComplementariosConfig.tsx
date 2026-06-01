import { useEffect, useMemo, useState } from "react";
import {
  Precios,
  CartItem,
  calcComplementarioPrecio,
  formatARS,
} from "@/lib/precios";
import { ArrowLeft, ShoppingCart } from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
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

const COLORES_LISA = ["azul", "gris", "negra", "roja", "verde", "sin_pintar"] as const;
const COLOR_DISPLAY: Record<string, string> = {
  azul: "Azul",
  gris: "Gris",
  negra: "Negra",
  roja: "Roja",
  verde: "Verde",
  sin_pintar: "Sin pintar",
};

function formatAutoperforanteKey(key: string): string {
  // e.g. "1_rosca_chapa" → `1" Rosca Chapa`
  const parts = key.split("_");
  const size = parts[0];
  const rest = parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return `${size}" ${rest.join(" ")}`;
}

function formatTornilloKey(key: string): string {
  // e.g. "T1_punta_aguja" → "T1 Punta Aguja"
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

export default function ComplementariosConfig({ precios, onBack, onAdd }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [subcategoria, setSubcategoria] = useState<Subcategoria | "">("");

  // Cumbreras state
  const [cumbrerasTipo, setCumbrerasTipo] = useState<CumbrerasTipo | "">("");
  const [lisaDesarrollo, setLisaDesarrollo] = useState<ListaDesarrollo | "">("");
  const [lisaColor, setLisaColor] = useState<string>("");
  const [metrosStr, setMetrosStr] = useState<string>("");

  // Autoperforantes / Tornillos state
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [bolsas, setBolsas] = useState<string>("1");

  // Estaño state
  const [estanoKey, setEstanoKey] = useState<string>("");
  const [estanoCantidad, setEstanoCantidad] = useState<number>(1);

  const [error, setError] = useState<string>("");

  function resetSubState() {
    setCumbrerasTipo("");
    setLisaDesarrollo("");
    setLisaColor("");
    setMetrosStr("");
    setSelectedKey("");
    setBolsas("1");
    setEstanoKey("");
    setEstanoCantidad(1);
    setError("");
  }

  // Derived cumbreras key
  const cumbrerasKey = useMemo(() => {
    if (cumbrerasTipo === "sinusoidal") return "sinusoidal_negra";
    if (cumbrerasTipo === "trapezoidal") return "trapezoidal_negra";
    if (cumbrerasTipo === "lisa" && lisaDesarrollo && lisaColor) {
      return `lisa_${lisaColor}_${lisaDesarrollo}`;
    }
    return "";
  }, [cumbrerasTipo, lisaDesarrollo, lisaColor]);

  const metros = useMemo(() => {
    const normalized = metrosStr.trim().replace(/,/g, ".");
    const n = Number.parseFloat(normalized);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [metrosStr]);

  // Preview computation
  const preview = useMemo(() => {
    if (!subcategoria) return null;

    if (subcategoria === "cumbreras") {
      if (!cumbrerasKey || metros === null) return null;
      return calcComplementarioPrecio(precios, "cumbreras", cumbrerasKey, metros);
    }

    if (subcategoria === "autoperforantes" || subcategoria === "tornillos") {
      if (!selectedKey) return null;
      const bolsasNum = Number.parseFloat(bolsas.replace(",", "."));
      if (!Number.isFinite(bolsasNum) || bolsasNum <= 0) return null;
      return calcComplementarioPrecio(precios, subcategoria, selectedKey, bolsasNum);
    }

    if (subcategoria === "estaño") {
      if (!estanoKey || estanoCantidad < 1) return null;
      return calcComplementarioPrecio(precios, "estaño", estanoKey, estanoCantidad);
    }

    return null;
  }, [subcategoria, cumbrerasKey, metros, selectedKey, bolsas, estanoKey, estanoCantidad, precios]);

  function handleAdd() {
    if (!subcategoria) { setError("Seleccioná una categoría"); return; }

    if (subcategoria === "cumbreras") {
      if (!cumbrerasTipo) { setError("Seleccioná el tipo de cumbrera"); return; }
      if (cumbrerasTipo === "lisa") {
        if (!lisaDesarrollo) { setError("Seleccioná el desarrollo"); return; }
        if (!lisaColor) { setError("Seleccioná el color"); return; }
      }
      if (metros === null) { setError("Ingresá la cantidad de metros"); return; }
      if (!cumbrerasKey) { setError("Selección incompleta"); return; }
      if (!preview) return;

      const tipoLabel =
        cumbrerasTipo === "sinusoidal"
          ? "Sinusoidal Negra"
          : cumbrerasTipo === "trapezoidal"
          ? "Trapezoidal Negra"
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

    if (subcategoria === "autoperforantes" || subcategoria === "tornillos") {
      if (!selectedKey) { setError("Seleccioná el producto"); return; }
      const bolsasNum = Number.parseFloat(bolsas.replace(",", "."));
      if (!Number.isFinite(bolsasNum) || bolsasNum <= 0) { setError("Ingresá la cantidad de bolsas"); return; }
      if (!preview) return;

      const keyLabel =
        subcategoria === "autoperforantes"
          ? formatAutoperforanteKey(selectedKey)
          : formatTornilloKey(selectedKey);

      const catLabel = subcategoria === "autoperforantes" ? "Autoperforante" : "Tornillo";
      onAdd({
        tipo: "complementario",
        descripcion: `${catLabel} ${keyLabel} × 100 uds`,
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

      const estanoLabel = estanoKey === "kg" ? "Estaño KG (8 barras ≈ 1070g)" : "Estaño Barra (133g)";
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

  // Lists from precios
  const autoperforanteKeys = Object.keys(precios.complementarios?.autoperforantes ?? {});
  const tornilloKeys = Object.keys(precios.complementarios?.tornillos ?? {});

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

            {/* CUMBRERAS */}
            {subcategoria === "cumbreras" && (
              <SectionCard
                step="02"
                title="Tipo de cumbrera"
                description="Seleccioná el perfil de la cumbrera."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["sinusoidal", "trapezoidal", "lisa"] as CumbrerasTipo[]).map((t) => (
                    <OptionButton
                      key={t}
                      active={cumbrerasTipo === t}
                      onClick={() => {
                        setCumbrerasTipo(t);
                        setLisaDesarrollo("");
                        setLisaColor("");
                        setMetrosStr("");
                        setError("");
                      }}
                    >
                      <span className="block capitalize">{t}</span>
                      {t === "sinusoidal" && <span className="mt-1 block text-xs font-bold opacity-70">Negra</span>}
                      {t === "trapezoidal" && <span className="mt-1 block text-xs font-bold opacity-70">Negra</span>}
                      {t === "lisa" && <span className="mt-1 block text-xs font-bold opacity-70">Varios colores</span>}
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {subcategoria === "cumbreras" && cumbrerasTipo === "lisa" && (
              <SectionCard
                step="03"
                title="Desarrollo"
                description="Elegí el desarrollo (ancho desarrollado) de la cumbrera lisa."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <OptionButton
                    active={lisaDesarrollo === "40"}
                    onClick={() => {
                      setLisaDesarrollo("40");
                      setLisaColor("");
                      setMetrosStr("");
                      setError("");
                    }}
                  >
                    <span className="block text-lg">40 cm</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">Desarrollo estándar</span>
                  </OptionButton>
                  <OptionButton
                    active={lisaDesarrollo === "60"}
                    onClick={() => {
                      setLisaDesarrollo("60");
                      setLisaColor("");
                      setMetrosStr("");
                      setError("");
                    }}
                  >
                    <span className="block text-lg">60 cm</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">Desarrollo amplio</span>
                  </OptionButton>
                </div>
              </SectionCard>
            )}

            {subcategoria === "cumbreras" && cumbrerasTipo === "lisa" && lisaDesarrollo && (
              <SectionCard
                step="04"
                title="Color"
                description="Elegí el color de la cumbrera lisa."
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {COLORES_LISA.map((c) => (
                    <OptionButton
                      key={c}
                      active={lisaColor === c}
                      onClick={() => {
                        setLisaColor(c);
                        setMetrosStr("");
                        setError("");
                      }}
                    >
                      <span className="block">{COLOR_DISPLAY[c]}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

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
                      type="text"
                      inputMode="decimal"
                      value={metrosStr}
                      onChange={(e) => {
                        setMetrosStr(e.target.value);
                        setError("");
                      }}
                      placeholder="Ej: 6.5"
                      className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl font-black text-slate-950 outline-none"
                    />
                    <span className="border-l border-slate-200 px-4 text-sm font-black text-slate-500">metros</span>
                  </div>
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

            {/* AUTOPERFORANTES */}
            {subcategoria === "autoperforantes" && (
              <SectionCard
                step="02"
                title="Producto"
                description="Elegí el tipo de autoperforante."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {autoperforanteKeys.map((key) => (
                    <OptionButton
                      key={key}
                      active={selectedKey === key}
                      onClick={() => {
                        setSelectedKey(key);
                        setBolsas("1");
                        setError("");
                      }}
                    >
                      <span className="block">{formatAutoperforanteKey(key)}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* TORNILLOS */}
            {subcategoria === "tornillos" && (
              <SectionCard
                step="02"
                title="Producto"
                description="Elegí el tipo de tornillo."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {tornilloKeys.map((key) => (
                    <OptionButton
                      key={key}
                      active={selectedKey === key}
                      onClick={() => {
                        setSelectedKey(key);
                        setBolsas("1");
                        setError("");
                      }}
                    >
                      <span className="block">{formatTornilloKey(key)}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {(subcategoria === "autoperforantes" || subcategoria === "tornillos") && selectedKey && (
              <SectionCard
                step="03"
                title="Cantidad (bolsas)"
                description="Cada bolsa contiene 100 unidades. Podés pedir media bolsa (0.5)."
              >
                <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 max-w-xs">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={bolsas}
                    min="0.5"
                    step="0.5"
                    onChange={(e) => {
                      setBolsas(e.target.value);
                      setError("");
                    }}
                    className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl font-black text-slate-950 outline-none"
                  />
                  <span className="border-l border-slate-200 px-4 text-sm font-black text-slate-500">bolsas</span>
                </div>
                <p className="mt-2 text-xs font-bold text-slate-500">
                  Precio por 100 unidades. Mínimo 0.5 = 50 unidades.
                </p>
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

            {/* ESTAÑO */}
            {subcategoria === "estaño" && (
              <SectionCard
                step="02"
                title="Presentación"
                description="Elegí la unidad de venta del estaño."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <OptionButton
                    active={estanoKey === "kg"}
                    onClick={() => {
                      setEstanoKey("kg");
                      setEstanoCantidad(1);
                      setError("");
                    }}
                  >
                    <span className="block text-base font-black">KG (paquete)</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">8 barras ≈ 1070g</span>
                  </OptionButton>
                  <OptionButton
                    active={estanoKey === "barra"}
                    onClick={() => {
                      setEstanoKey("barra");
                      setEstanoCantidad(1);
                      setError("");
                    }}
                  >
                    <span className="block text-base font-black">Barra individual</span>
                    <span className="mt-1 block text-xs font-bold opacity-70">1 barra ≈ 133g</span>
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
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-xs">
                  <button
                    type="button"
                    onClick={() => setEstanoCantidad((p) => Math.max(1, p - 1))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <div className="text-3xl font-black text-slate-950">{estanoCantidad}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {estanoKey === "kg" ? "paquete" + (estanoCantidad !== 1 ? "s" : "") : "barra" + (estanoCantidad !== 1 ? "s" : "")}
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

          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
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
                  {subcategoria === "cumbreras" && (
                    <>
                      <SummaryRow
                        label="Tipo"
                        value={
                          cumbrerasTipo
                            ? cumbrerasTipo === "lisa"
                              ? `Lisa ${COLOR_DISPLAY[lisaColor] ?? "—"} des. ${lisaDesarrollo || "—"}`
                              : cumbrerasTipo.charAt(0).toUpperCase() + cumbrerasTipo.slice(1) + " Negra"
                            : "—"
                        }
                      />
                      <SummaryRow label="Metros" value={metros !== null ? `${metros.toFixed(2)} m` : "—"} />
                    </>
                  )}
                  {(subcategoria === "autoperforantes" || subcategoria === "tornillos") && (
                    <>
                      <SummaryRow
                        label="Producto"
                        value={
                          selectedKey
                            ? subcategoria === "autoperforantes"
                              ? formatAutoperforanteKey(selectedKey)
                              : formatTornilloKey(selectedKey)
                            : "—"
                        }
                      />
                      <SummaryRow
                        label="Bolsas"
                        value={
                          bolsas && Number.parseFloat(bolsas) > 0
                            ? `${bolsas} × 100 uds`
                            : "—"
                        }
                      />
                    </>
                  )}
                  {subcategoria === "estaño" && (
                    <>
                      <SummaryRow
                        label="Presentación"
                        value={estanoKey === "kg" ? "KG (paquete)" : estanoKey === "barra" ? "Barra" : "—"}
                      />
                      <SummaryRow
                        label="Cantidad"
                        value={
                          estanoKey
                            ? `${estanoCantidad} ${estanoKey === "kg" ? "paquete" + (estanoCantidad !== 1 ? "s" : "") : "barra" + (estanoCantidad !== 1 ? "s" : "")}`
                            : "—"
                        }
                      />
                    </>
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
