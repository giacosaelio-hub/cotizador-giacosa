import { useEffect, useMemo, useState } from "react";
import {
  Precios,
  CartItem,
  BobinaVariante,
  calcBobinaPrecio,
  formatARS,
} from "@/lib/precios";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  PackageCheck,
  Ruler,
  ShoppingCart,
} from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}

const WA_NUMBER = "5493815589875";
const BOBINA_IMAGE = "/images/productos/bobinas.png";

const colorStyles: Record<string, string> = {
  blanca: "#f8fafc",
  blanco: "#f8fafc",
  negra: "#111827",
  negro: "#111827",
  roja: "#dc2626",
  rojo: "#dc2626",
  azul: "#1d4ed8",
  verde: "#15803d",
  gris: "#6b7280",
};

function parseDecimal(value: string): number {
  const normalized = value.trim().replace(/,/g, ".");
  return Number.parseFloat(normalized);
}

function formatMeters(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(2)} ${value === 1 ? "metro" : "metros"}`;
}

function getColorHex(color: string): string {
  return colorStyles[color.trim().toLowerCase()] ?? "#0f172a";
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

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="text-right font-black text-slate-900">{value}</span>
    </div>
  );
}

function BobinaImage({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(241,245,249,0.96)_45%,rgba(226,232,240,0.96)_100%)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.07),transparent_38%,rgba(15,23,42,0.05))]" />
      <img
        src={BOBINA_IMAGE}
        alt="Bobina de acero"
        className="relative z-10 h-full w-full object-contain p-5 drop-shadow-[0_18px_28px_rgba(15,23,42,0.18)]"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="pointer-events-none absolute inset-x-10 bottom-4 h-5 rounded-full bg-slate-900/10 blur-xl" />
    </div>
  );
}

export default function BobinaConfig({ precios, onBack, onAdd }: Props) {
  const variantes: BobinaVariante[] = precios.bobinas_variantes ?? [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [calibre, setCalibre] = useState<string>("");
  const [ancho, setAncho] = useState<string>("");
  const [tipo, setTipo] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [metrosStr, setMetrosStr] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [error, setError] = useState<string>("");

  const calibresDisponibles = useMemo(() => {
    const unicos: number[] = [];
    for (const v of variantes) {
      if (!unicos.includes(v.calibre)) unicos.push(v.calibre);
    }
    return unicos.sort((a, b) => a - b);
  }, [variantes]);

  const anchosDisponibles = useMemo(() => {
    if (!calibre) return [];
    const calN = parseInt(calibre, 10);
    const unicos: number[] = [];
    for (const v of variantes) {
      if (v.calibre === calN && !unicos.includes(v.ancho)) unicos.push(v.ancho);
    }
    return unicos.sort((a, b) => a - b);
  }, [calibre, variantes]);

  const tiposDisponibles = useMemo(() => {
    if (!calibre || !ancho) return [];
    const calN = parseInt(calibre, 10);
    const anchoN = parseFloat(ancho);
    const tipos: string[] = [];
    for (const v of variantes) {
      if (v.calibre === calN && v.ancho === anchoN && !tipos.includes(v.tipo)) tipos.push(v.tipo);
    }
    return tipos;
  }, [calibre, ancho, variantes]);

  const coloresDisponibles = useMemo(() => {
    if (!calibre || !ancho || tipo !== "Prepintada") return [];
    const calN = parseInt(calibre, 10);
    const anchoN = parseFloat(ancho);
    const colores: string[] = [];
    for (const v of variantes) {
      if (
        v.calibre === calN &&
        v.ancho === anchoN &&
        v.tipo === "Prepintada" &&
        v.color &&
        !colores.includes(v.color)
      ) {
        colores.push(v.color);
      }
    }
    return colores;
  }, [calibre, ancho, tipo, variantes]);

  const varianteSeleccionada = useMemo(() => {
    if (!calibre || !ancho || !tipo) return null;
    const calN = parseInt(calibre, 10);
    const anchoN = parseFloat(ancho);
    if (tipo === "Galvanizada") {
      return variantes.find(
        (v) => v.calibre === calN && v.ancho === anchoN && v.tipo === "Galvanizada"
      ) ?? null;
    }
    if (tipo === "Prepintada" && color) {
      return variantes.find(
        (v) =>
          v.calibre === calN &&
          v.ancho === anchoN &&
          v.tipo === "Prepintada" &&
          v.color === color
      ) ?? null;
    }
    return null;
  }, [calibre, ancho, tipo, color, variantes]);

  const metros = parseDecimal(metrosStr);
  const metrosValido = metrosStr.trim() !== "" && Number.isFinite(metros) && metros > 0;
  const isWhatsApp = metrosValido && metros > 30;

  const preview = useMemo(() => {
    if (!varianteSeleccionada || !metrosValido || isWhatsApp) return null;
    return calcBobinaPrecio(
      precios,
      varianteSeleccionada.calibre,
      varianteSeleccionada.ancho,
      varianteSeleccionada.tipo === "Galvanizada" ? "Galvanizada" : varianteSeleccionada.color || "",
      metros
    );
  }, [precios, varianteSeleccionada, metros, metrosValido, isWhatsApp]);

  const precioPorMetroARS = preview?.precioUnitarioARS ?? 0;
  const precioPorBobinaARS = preview?.subtotalARS ?? 0;
  const totalFinalARS = precioPorBobinaARS * cantidad;

  const puedeElegirMetros = Boolean(
    calibre &&
      ancho &&
      tipo &&
      ((tipo !== "Prepintada") || (tipo === "Prepintada" && color)) &&
      varianteSeleccionada
  );

  function buildDescripcion(): string {
    if (!varianteSeleccionada) return "Selección incompleta";
    const cal = `Cal. ${varianteSeleccionada.calibre}`;
    const anchoStr = `${varianteSeleccionada.ancho.toFixed(2)} mts`;
    if (varianteSeleccionada.tipo === "Prepintada" && varianteSeleccionada.color) {
      return `Bobina Prepintada ${varianteSeleccionada.color} ${cal} - ${anchoStr}`;
    }
    return `Bobina Galvanizada ${cal} - ${anchoStr}`;
  }

  const handleChangeCalibre = (v: string) => {
    setCalibre(v);
    setAncho("");
    setTipo("");
    setColor("");
    setMetrosStr("");
    setCantidad(1);
    setError("");
  };

  const handleChangeAncho = (v: string) => {
    setAncho(v);
    setTipo("");
    setColor("");
    setMetrosStr("");
    setCantidad(1);
    setError("");
  };

  const handleChangeTipo = (v: string) => {
    setTipo(v);
    setColor("");
    setMetrosStr("");
    setCantidad(1);
    setError("");
  };

  const handleChangeColor = (v: string) => {
    setColor(v);
    setMetrosStr("");
    setCantidad(1);
    setError("");
  };

  function handleAdd() {
    if (!calibre) { setError("Seleccioná el calibre"); return; }
    if (!ancho) { setError("Seleccioná el ancho"); return; }
    if (!tipo) { setError("Seleccioná el tipo"); return; }
    if (tipo === "Prepintada" && !color) { setError("Seleccioná un color"); return; }
    if (!metrosValido) { setError("Ingresá la cantidad de metros"); return; }
    if (!varianteSeleccionada) { setError("Combinación inválida"); return; }
    if (isWhatsApp) return;

    setError("");
    const { precioUnitarioUSD, subtotalARS } = calcBobinaPrecio(
      precios,
      varianteSeleccionada.calibre,
      varianteSeleccionada.ancho,
      varianteSeleccionada.tipo === "Galvanizada"
        ? "Galvanizada"
        : varianteSeleccionada.color || "",
      metros
    );

    // En bobinas, la unidad comercial del carrito es UNA bobina de X metros.
    // Por eso el precio unitario del carrito debe ser el precio de una bobina completa,
    // no el precio por metro.
    const precioBobinaCompletaARS = subtotalARS;
    const precioBobinaCompletaUSD = precioUnitarioUSD * metros;
    const medida = `${metros.toFixed(2)} metros c/u`;

    onAdd({
      tipo: "bobina",
      descripcion: buildDescripcion(),
      medida,
      cantidad,
      precioUnitarioUSD: precioBobinaCompletaUSD,
      precioUnitarioARS: precioBobinaCompletaARS,
      subtotalARS: precioBobinaCompletaARS * cantidad,
    });
  }

  function handleWhatsApp() {
    let txt = `Hola, quiero consultar precio de ${formatMeters(metros)} de bobina calibre ${calibre} - ${ancho} mts`;
    if (tipo === "Prepintada" && color) txt += ` prepintada ${color}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(txt)}`, "_blank");
  }

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
            <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(135deg,transparent,rgba(15,23,42,0.04))]" />
            <div className="relative mx-auto max-w-3xl">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-emerald-700">Inicio / Bobinas de Acero</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Armá tu bobina</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-600">
                Seleccioná calibre, ancho y metros. El precio se actualiza al instante antes de sumar el producto a tu cotización.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-800 shadow-sm">Venta por metro</span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">Calibres 22 · 25 · 27</span>
                <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">Precio actualizado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]">
          <div className="space-y-5">
            <SectionCard
              step="01"
              title="Elegí el calibre"
              description="El calibre define el espesor de la bobina disponible."
            >
              {calibresDisponibles.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {calibresDisponibles.map((c) => (
                    <OptionButton
                      key={c}
                      active={calibre === String(c)}
                      onClick={() => handleChangeCalibre(String(c))}
                    >
                      <span className="block text-lg">Cal. {c}</span>
                      <span className="mt-1 block text-xs font-bold opacity-70">
                        {c <= 22 ? "Más resistente" : c === 25 ? "Uso estándar" : "Más liviano"}
                      </span>
                    </OptionButton>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay bobinas cargadas.</p>
              )}
            </SectionCard>

            {calibre && (
              <SectionCard
                step="02"
                title="Seleccioná el ancho"
                description="Elegí el ancho disponible para el calibre seleccionado."
              >
                {anchosDisponibles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {anchosDisponibles.map((a) => (
                      <OptionButton
                        key={a}
                        active={ancho === String(a)}
                        onClick={() => handleChangeAncho(String(a))}
                      >
                        <span className="block text-lg">{a.toFixed(2)} m</span>
                        <span className="mt-1 block text-xs font-bold opacity-70">Ancho de bobina</span>
                      </OptionButton>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay anchos disponibles para este calibre.</p>
                )}
              </SectionCard>
            )}

            {calibre && ancho && (
              <SectionCard
                step="03"
                title="Tipo de bobina"
                description="Seleccioná la terminación disponible para esta combinación."
              >
                {tiposDisponibles.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {tiposDisponibles.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleChangeTipo(t)}
                        className={`group relative overflow-hidden rounded-[22px] border bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                          tipo === t ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500/20" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <BobinaImage className="h-20 w-24 shrink-0 rounded-2xl border border-slate-100" />
                          <div>
                            <h4 className="text-lg font-black text-slate-950">{t}</h4>
                            <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
                              {t === "Prepintada" ? "Terminación color, sujeta a disponibilidad." : "Terminación galvanizada para uso estructural."}
                            </p>
                          </div>
                        </div>
                        <span className={`absolute right-4 top-4 inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                          tipo === t ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent"
                        }`}>
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay tipos para ese calibre y ancho.</p>
                )}
              </SectionCard>
            )}

            {calibre && ancho && tipo === "Prepintada" && (
              <SectionCard
                step="04"
                title="Elegí el color"
                description="Los colores disponibles dependen de la bobina seleccionada."
              >
                {coloresDisponibles.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {coloresDisponibles.map((c) => {
                      const active = color === c;
                      const hex = getColorHex(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleChangeColor(c)}
                          title={c}
                          aria-label={`Color ${c}`}
                          className={`relative h-12 w-12 rounded-full border-2 transition-all hover:scale-105 ${
                            active ? "border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-200"
                          }`}
                          style={{ backgroundColor: hex }}
                        >
                          {active && (
                            <span className="absolute inset-0 m-auto inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                              <CheckCircle2 className="h-4 w-4" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">No hay colores disponibles para esa selección.</p>
                )}
              </SectionCard>
            )}

            {puedeElegirMetros && (
              <SectionCard
                step="05"
                title="Definí metros y cantidad"
                description="Elegí cuántos metros lleva cada bobina y cuántas bobinas querés comprar."
              >
                <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-800">Metros por bobina</label>
                    <div className="flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={metrosStr}
                        onChange={(event) => {
                          setMetrosStr(event.target.value);
                          setError("");
                        }}
                        placeholder="Ej: 15,24"
                        className="min-w-0 flex-1 bg-transparent px-5 py-4 text-2xl font-black text-slate-950 outline-none"
                      />
                      <span className="border-l border-slate-200 px-4 text-sm font-black text-slate-500">metros</span>
                    </div>

                    {metrosValido && (
                      <p className="mt-2 text-sm font-bold text-emerald-700">
                        Cada bobina tendrá {formatMeters(metros)}.
                      </p>
                    )}
                    {isWhatsApp && (
                      <p className="mt-2 text-sm font-bold text-amber-700">
                        Para bobinas de más de 30 metros, consultá precio mayorista por WhatsApp.
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 24, 30].map((m) => (
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
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-800">Cantidad de bobinas</label>
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        -
                      </button>

                      <div className="text-center">
                        <div className="text-3xl font-black text-slate-950">{cantidad}</div>
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">bobinas</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCantidad((prev) => prev + 1)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        +
                      </button>
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-500">
                      Total: {cantidad} bobina{cantidad > 1 ? "s" : ""} de {metrosValido ? formatMeters(metros) : "—"} cada una.
                    </p>
                  </div>
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
              <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-800">Resumen de cotización</p>
                <p className="mt-1 text-sm font-extrabold text-slate-600">Tu selección en tiempo real</p>
              </div>

              <div className="p-5">
                <BobinaImage className="mb-5 h-44 rounded-[22px] border border-slate-100" />

                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow label="Calibre" value={calibre ? `Cal. ${calibre}` : "—"} />
                  <SummaryRow label="Ancho" value={ancho ? `${Number(ancho).toFixed(2)} m` : "—"} />
                  <SummaryRow label="Tipo" value={tipo || "—"} />
                  {tipo === "Prepintada" && <SummaryRow label="Color" value={color || "—"} />}
                  <SummaryRow label="Metros por bobina" value={metrosValido ? formatMeters(metros) : "—"} />
                  <SummaryRow label="Cantidad" value={`${cantidad} bobina${cantidad > 1 ? "s" : ""}`} />
                </div>

                <div className="mt-4 space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow
                    label="Precio por metro"
                    value={preview ? formatARS(precioPorMetroARS) : "—"}
                  />
                  <SummaryRow
                    label="Precio por bobina"
                    value={preview ? formatARS(precioPorBobinaARS) : "—"}
                  />
                  <SummaryRow
                    label="Total"
                    value={preview ? formatARS(totalFinalARS) : "—"}
                  />
                </div>

                <div className="mt-5 rounded-2xl bg-emerald-700 px-4 py-4 text-white shadow-lg shadow-emerald-800/20">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-black uppercase tracking-wide">Total final</span>
                    <span className="text-2xl font-black tracking-tight">
                      {preview ? formatARS(totalFinalARS) : "—"}
                    </span>
                  </div>
                </div>

                {isWhatsApp ? (
                  <button
                    onClick={handleWhatsApp}
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-4 text-base font-black text-white shadow-lg transition hover:brightness-95"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Consultar por WhatsApp
                  </button>
                ) : (
                  <button
                    onClick={handleAdd}
                    disabled={!preview}
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-4 text-base font-black text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cantidad > 1 ? `Agregar ${cantidad} bobinas` : "Agregar al carrito"}
                  </button>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <Ruler className="mb-2 h-5 w-5 text-emerald-700" />
                    <p className="text-xs font-black text-slate-800">Venta por metro</p>
                    <p className="text-xs font-medium text-slate-500">Cotizá la medida exacta.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <PackageCheck className="mb-2 h-5 w-5 text-emerald-700" />
                    <p className="text-xs font-black text-slate-800">Precio actualizado</p>
                    <p className="text-xs font-medium text-slate-500">Según tu selección.</p>
                  </div>
                </div>

                {!isWhatsApp && !preview && (
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
