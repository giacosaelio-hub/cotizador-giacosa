import React, { useEffect, useMemo, useState } from "react";
import {
  Precios,
  CartItem,
  calcPerfilCPrecio,
  formatARS,
  formatUSD,
} from "@/lib/precios";
import {
  ArrowLeft,
  PackageCheck,
  Ruler,
  ShoppingCart,
} from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}

// "80x1.6" → "80 × 1.6 mm"
function formatPerfilKey(key: string): string {
  return key.replace("x", " × ") + " mm";
}

// "80x1.6" → "80"
function getAltoFromKey(key: string): string {
  return key.split("x")[0];
}

// "80x1.6" → "1.6"
function getEspesorFromKey(key: string): string {
  return key.split("x")[1];
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

function PerfilImg() {
  const [failed, setFailed] = React.useState(false);
  if (failed) return null;
  return (
    <div className="h-44 w-full overflow-hidden bg-slate-50">
      <img
        src="/images/productos/perfil-c-derecha.webp"
        alt="Perfil C estructural"
        className="h-full w-full object-cover object-center"
        loading="lazy"
        onError={() => setFailed(true)}
        draggable={false}
      />
    </div>
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

export default function PerfilCConfig({ precios, onBack, onAdd }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [subtipo, setSubtipo] = useState<"comun" | "galvanizado" | "">("");
  const [espesorComun, setEspesorComun] = useState<string>("");
  const [medida, setMedida] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [error, setError] = useState<string>("");

  // All keys for comun
  const comunKeys = useMemo(
    () => Object.keys(precios.perfil_c?.comun ?? {}),
    [precios]
  );
  const galvanizadoKeys = useMemo(
    () => Object.keys(precios.perfil_c?.galvanizado ?? {}),
    [precios]
  );

  // Unique espesores for comun (sorted)
  const espesorasDisponibles = useMemo(() => {
    const set = new Set(comunKeys.map(getEspesorFromKey));
    return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, [comunKeys]);

  // Altos for selected espesor in comun
  const altosDisponibles = useMemo(() => {
    if (!espesorComun) return [];
    return comunKeys
      .filter((k) => getEspesorFromKey(k) === espesorComun)
      .map(getAltoFromKey)
      .sort((a, b) => parseInt(a) - parseInt(b));
  }, [comunKeys, espesorComun]);

  const preview = useMemo(() => {
    if (!subtipo || !medida) return null;
    return calcPerfilCPrecio(precios, subtipo, medida, cantidad);
  }, [precios, subtipo, medida, cantidad]);

  function handleChangeSubtipo(v: "comun" | "galvanizado") {
    setSubtipo(v);
    setEspesorComun("");
    setMedida("");
    setCantidad(1);
    setError("");
  }

  function handleChangeEspesor(e: string) {
    setEspesorComun(e);
    setMedida("");
    setError("");
  }

  function handleAdd() {
    if (!subtipo) { setError("Seleccioná el tipo de perfil"); return; }
    if (subtipo === "comun" && !espesorComun) { setError("Seleccioná el espesor"); return; }
    if (!medida) { setError("Seleccioná la medida"); return; }
    if (cantidad < 1) { setError("La cantidad debe ser al menos 1"); return; }
    if (!preview) { setError("Combinación inválida"); return; }

    setError("");
    const subtipoLabel = subtipo === "comun" ? "Perfil C" : "Perfil C Galvanizado";
    onAdd({
      tipo: "perfil_c",
      descripcion: `${subtipoLabel} ${formatPerfilKey(medida)} · 12 m/barra`,
      medida: "12 m/barra",
      cantidad,
      precioUnitarioUSD: preview.precioUnitarioUSD,
      precioUnitarioARS: preview.precioUnitarioARS,
      subtotalARS: preview.subtotalARS,
    });
  }

  // Resolve step numbers dynamically
  const stepMedidaGalv = "02";
  const stepEspesor = "02";
  const stepAlto = "03";
  const stepCantidadComun = "04";
  const stepCantidadGalv = "03";

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

        <div className="mb-6 overflow-hidden rounded-[30px] border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f7fffb_48%,#eefbf4_100%)] shadow-[0_24px_80px_rgba(15,23,42,0.07)]">
          <div className="relative px-6 py-7 text-center sm:px-10 lg:px-12 lg:py-8">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.16),transparent_58%)]" />
            <div className="relative mx-auto max-w-3xl">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-emerald-700">Inicio / Perfil C Estructural</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Cotizá tu Perfil C</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                Elegí el tipo, la medida y la cantidad de barras. El precio se actualiza al instante.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-800 shadow-sm">12 metros / barra</span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">Común · Galvanizado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]">
          <div className="space-y-5">

            {/* PASO 01 — Tipo */}
            <SectionCard
              step="01"
              title="Tipo de Perfil C"
              description="Elegí entre perfil común o galvanizado."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionButton
                  active={subtipo === "comun"}
                  onClick={() => handleChangeSubtipo("comun")}
                >
                  <span className="block text-lg">Perfil C</span>
                </OptionButton>
                <OptionButton
                  active={subtipo === "galvanizado"}
                  onClick={() => handleChangeSubtipo("galvanizado")}
                >
                  <span className="block text-lg">Perfil C Galvanizado</span>
                </OptionButton>
              </div>
            </SectionCard>

            {/* PASO 02 — Alma menor (solo comun) */}
            {subtipo === "comun" && (
              <SectionCard
                step={stepEspesor}
                title="Alma menor"
                description="Elegí el espesor real del acero (alma menor del perfil)."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {espesorasDisponibles.map((e) => (
                    <OptionButton
                      key={e}
                      active={espesorComun === e}
                      onClick={() => handleChangeEspesor(e)}
                    >
                      <span className="block text-lg font-black">{e} mm</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* PASO 02 — Medida directa (galvanizado) */}
            {subtipo === "galvanizado" && (
              <SectionCard
                step={stepMedidaGalv}
                title="Medida"
                description="Alto × espesor del perfil."
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  {galvanizadoKeys.map((key) => (
                    <OptionButton
                      key={key}
                      active={medida === key}
                      onClick={() => { setMedida(key); setError(""); }}
                    >
                      <span className="block text-base">{formatPerfilKey(key)}</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* PASO 03 — Alto (solo comun con espesor elegido) */}
            {subtipo === "comun" && espesorComun && (
              <SectionCard
                step={stepAlto}
                title="Alto del perfil"
                description={`Medidas disponibles para espesor ${espesorComun} mm.`}
              >
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {altosDisponibles.map((alto) => {
                    const key = `${alto}x${espesorComun}`;
                    return (
                      <OptionButton
                        key={key}
                        active={medida === key}
                        onClick={() => { setMedida(key); setError(""); }}
                      >
                        <span className="block text-lg font-black">{alto} mm</span>
                      </OptionButton>
                    );
                  })}
                </div>
                {medida && (
                  <p className="mt-3 text-xs font-semibold text-slate-400">
                    Medida seleccionada: alto {getAltoFromKey(medida)} mm · espesor {espesorComun} mm · ala 15 mm
                  </p>
                )}
              </SectionCard>
            )}

            {/* PASO — Cantidad */}
            {((subtipo === "comun" && medida) || (subtipo === "galvanizado" && medida)) && (
              <SectionCard
                step={subtipo === "comun" ? stepCantidadComun : stepCantidadGalv}
                title="Cantidad de barras"
                description="Cada barra mide 12 metros."
              >
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm max-w-xs">
                  <button
                    type="button"
                    onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    −
                  </button>
                  <div className="text-center">
                    <div className="text-3xl font-black text-slate-950">{cantidad}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      barra{cantidad !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCantidad((prev) => prev + 1)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    +
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Total: {cantidad} barra{cantidad !== 1 ? "s" : ""} × 12 m = {cantidad * 12} metros lineales
                </p>
                {/* Nota varas 6 m */}
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
                  <span className="font-black">¿Necesitás varas de 6 m?</span> Cada barra de 12 m se puede cortar en 2 piezas de 6 m. En ese caso, pedí cantidad en múltiplos de 2 (2, 4, 6…).
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
              <PerfilImg />
              <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">Resumen de cotización</p>
                <p className="mt-1 text-sm font-extrabold text-slate-600">Tu selección en tiempo real</p>
              </div>

              <div className="p-5">
                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow
                    label="Tipo"
                    value={subtipo === "comun" ? "Perfil C" : subtipo === "galvanizado" ? "Perfil C Galvanizado" : "—"}
                  />
                  <SummaryRow label="Medida" value={medida ? formatPerfilKey(medida) : "—"} />
                  <SummaryRow label="Largo" value="12 m / barra" />
                  <SummaryRow label="Cantidad" value={`${cantidad} barra${cantidad !== 1 ? "s" : ""}`} />
                </div>

                <div className="mt-4 space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow
                    label="Precio unitario (USD)"
                    value={preview ? formatUSD(preview.precioUnitarioUSD) : "—"}
                  />
                  <SummaryRow
                    label="Precio unitario (ARS)"
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
                  {cantidad > 1 ? `Agregar ${cantidad} barras` : "Agregar al carrito"}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <Ruler className="mb-2 h-5 w-5 text-emerald-700" />
                    <p className="text-xs font-black text-slate-800">12 m / barra</p>
                    <p className="text-xs font-medium text-slate-500">Largo estándar.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <PackageCheck className="mb-2 h-5 w-5 text-emerald-700" />
                    <p className="text-xs font-black text-slate-800">Precio con IVA</p>
                    <p className="text-xs font-medium text-slate-500">USD + tipo de cambio.</p>
                  </div>
                </div>

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
