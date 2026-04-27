import { useEffect, useMemo, useState } from "react";
import {
  Precios,
  CartItem,
  CHAPAS_ESTANDAR_CATS,
  ESTANDAR_VARIANTES,
  MEDIDA_LABELS,
  COLORES_PREPINTADA,
  buildEstandarKey,
  calcEstandarPrecio,
  formatARS,
} from "@/lib/precios";
import {
  ArrowLeft,
  CheckCircle2,
  Layers3,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";

interface Props {
  precios: Precios;
  onBack: () => void;
  onAdd: (item: Omit<CartItem, "id">) => void;
}

const FALLBACK_IMAGE = "/images/productos/chapas-estandar.png";

const CATEGORY_IMAGES: Record<string, string> = {
  negra_estampada: "/images/configurador/estandar/negra-estampada.png",
  chapa_negra_estampada: "/images/configurador/estandar/negra-estampada.png",
  lisa_negra: "/images/configurador/estandar/lisa-negra.png",
  lisa_negra_laf: "/images/configurador/estandar/lisa-negra.png",
  chapa_lisa_negra: "/images/configurador/estandar/lisa-negra.png",
  chapa_lisa_negra_laf: "/images/configurador/estandar/lisa-negra.png",
  lisa_galvanizada: "/images/configurador/estandar/lisa-galvanizada.png",
  chapa_lisa_galvanizada: "/images/configurador/estandar/lisa-galvanizada.png",
  lisa_prepintada: "/images/configurador/estandar/lisa-prepintada.png",
  chapa_lisa_prepintada: "/images/configurador/estandar/lisa-prepintada.png",
};

const colorStyles: Record<string, string> = {
  azul: "#1d4ed8",
  gris: "#6b7280",
  celeste: "#38bdf8",
  negra: "#111827",
  negro: "#111827",
  roja: "#dc2626",
  rojo: "#dc2626",
  verde: "#15803d",
  blanca: "#f8fafc",
  blanco: "#f8fafc",
};

function normalizeCategoryText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(laf\)/g, " laf ")
    .replace(/[()]/g, " ")
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");
}

function getCategoryImage(category: string, label = ""): string {
  const text = normalizeCategoryText(`${category} ${label}`);

  if (text.includes("negra") && text.includes("estampada")) {
    return "/images/configurador/estandar/negra-estampada.png";
  }

  if (text.includes("galvanizada")) {
    return "/images/configurador/estandar/lisa-galvanizada.png";
  }

  if (text.includes("prepintada")) {
    return "/images/configurador/estandar/lisa-prepintada.png";
  }

  if (text.includes("lisa") && text.includes("negra")) {
    return "/images/configurador/estandar/lisa-negra.png";
  }

  return CATEGORY_IMAGES[category] ?? FALLBACK_IMAGE;
}

function getColorHex(color: string): string {
  return colorStyles[color.trim().toLowerCase()] ?? "#0f172a";
}

function ProductImage({
  src,
  alt,
  className = "",
  imageClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.96),rgba(241,245,249,0.96)_48%,rgba(226,232,240,0.94)_100%)] ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.06),transparent_36%,rgba(15,23,42,0.04))]" />
      <img
        src={src}
        alt={alt}
        className={`relative z-10 h-full w-full object-contain drop-shadow-[0_16px_24px_rgba(15,23,42,0.16)] ${imageClassName}`}
        onError={(event) => {
          if (!event.currentTarget.src.includes(FALLBACK_IMAGE)) {
            event.currentTarget.src = FALLBACK_IMAGE;
          } else {
            event.currentTarget.style.display = "none";
          }
        }}
      />
      <div className="pointer-events-none absolute inset-x-10 bottom-4 h-5 rounded-full bg-slate-900/10 blur-xl" />
    </div>
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

export default function ChapaEstandarConfig({ precios, onBack, onAdd }: Props) {
  const [categoria, setCategoria] = useState("");
  const [calibre, setCalibre] = useState("");
  const [medida, setMedida] = useState("");
  const [color, setColor] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const categoriasDisponibles = Object.keys(precios.chapas_estandar || {});
  const categoriaValida = !!(categoria && categoriasDisponibles.includes(categoria));
  const isPrepintada = categoria === "lisa_prepintada";
  const catLabel = CHAPAS_ESTANDAR_CATS.find((c) => c.key === categoria)?.label ?? "";
  const variantesParaCat = ESTANDAR_VARIANTES[categoria] ?? [];
  const calibresDisponibles = variantesParaCat.map((v) => v.calibre);
  const calibreValido = categoriaValida && calibre && calibresDisponibles.includes(calibre);

  const medidasDisponibles =
    variantesParaCat.find((v) => v.calibre === calibre)?.medidas ?? [];
  const medidaValida = calibreValido && medida && medidasDisponibles.includes(medida);

  const precioKey = calibre && medida ? buildEstandarKey(calibre, medida) : "";

  const existeKeyEnPrecios =
    categoriaValida &&
    precioKey &&
    precios.chapas_estandar &&
    precios.chapas_estandar[categoria] &&
    Object.prototype.hasOwnProperty.call(precios.chapas_estandar[categoria], precioKey);

  const preview = useMemo(() => {
    if (
      !categoriaValida ||
      !calibreValido ||
      !medidaValida ||
      (isPrepintada && !color) ||
      cantidad < 1 ||
      !existeKeyEnPrecios
    ) {
      return null;
    }

    const result = calcEstandarPrecio(precios, categoria, precioKey, cantidad);
    if (
      !result ||
      Number.isNaN(result.precioUnitarioARS) ||
      Number.isNaN(result.subtotalARS) ||
      !isFinite(result.precioUnitarioARS) ||
      !isFinite(result.subtotalARS)
    ) {
      return null;
    }
    return result;
  }, [
    categoria,
    calibre,
    medida,
    color,
    cantidad,
    precios,
    isPrepintada,
    precioKey,
    categoriaValida,
    calibreValido,
    medidaValida,
    existeKeyEnPrecios,
  ]);

  const mostrarMensajeNoExiste =
    categoriaValida &&
    calibreValido &&
    medidaValida &&
    (!isPrepintada || color) &&
    cantidad > 0 &&
    !existeKeyEnPrecios;

  function buildDescripcion(): string {
    const medidaLabel = MEDIDA_LABELS[medida] ?? medida;
    if (isPrepintada && color) return `${catLabel} ${color} ${calibre} — ${medidaLabel}`;
    return `${catLabel} ${calibre} — ${medidaLabel}`;
  }

  function handleAdd() {
    if (!categoriaValida || !calibreValido || !medidaValida) {
      setError("Completá la configuración del producto");
      return;
    }
    if (isPrepintada && !color) {
      setError("Seleccioná un color");
      return;
    }
    if (cantidad < 1 || cantidad > 300) {
      setError("Cantidad inválida (máx. 300)");
      return;
    }
    if (!existeKeyEnPrecios) {
      setError("No existe precio para esta combinación");
      return;
    }

    setError("");
    const result = calcEstandarPrecio(precios, categoria, precioKey, cantidad);
    if (
      !result ||
      Number.isNaN(result.precioUnitarioARS) ||
      Number.isNaN(result.subtotalARS) ||
      !isFinite(result.precioUnitarioARS) ||
      !isFinite(result.subtotalARS)
    ) {
      setError("No existe precio para esta combinación");
      return;
    }

    const { precioUnitarioUSD, precioUnitarioARS, subtotalARS } = result;
    const medidaLabel = MEDIDA_LABELS[medida] ?? medida;
    onAdd({
      tipo: "chapa_estandar",
      descripcion: buildDescripcion(),
      medida: medidaLabel,
      cantidad,
      precioUnitarioUSD,
      precioUnitarioARS,
      subtotalARS,
    });
    window.alert("Producto agregado a tu cotización");
  }

  const selectedImage = getCategoryImage(categoria, catLabel);
  const selectedMedidaLabel = medida ? MEDIDA_LABELS[medida] ?? medida : "—";

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

        <div className="mb-5 rounded-[28px] border border-emerald-100 bg-emerald-50/55 px-6 py-8 text-center shadow-[0_20px_70px_rgba(15,23,42,0.05)] sm:px-8 lg:px-10">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-800">
            Inicio / Chapas estándar
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Elegí tu chapa estándar
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-600">
            Seleccioná categoría, calibre, medida y cantidad. El precio se actualiza antes de sumar el producto a tu cotización.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-700 shadow-sm">
              Precio por unidad
            </span>
            <span className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">
              Medidas fijas
            </span>
            <span className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-700 shadow-sm">
              Stock sujeto a disponibilidad
            </span>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_390px]">
          <div className="space-y-5">
            <SectionCard
              step="01"
              title="Elegí la categoría"
              description="Seleccioná el tipo de chapa estándar que necesitás."
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {CHAPAS_ESTANDAR_CATS.map((c) => {
                  const active = categoria === c.key;
                  const image = getCategoryImage(c.key, c.label);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setCategoria(c.key);
                        setCalibre("");
                        setMedida("");
                        setColor("");
                        setCantidad(1);
                        setError("");
                      }}
                      className={`group relative overflow-hidden rounded-[24px] border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                        active
                          ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500/20"
                          : "border-slate-200"
                      }`}
                    >
                      <ProductImage
                        src={image}
                        alt={c.label}
                        className="h-36 rounded-b-none border-x-0 border-t-0"
                        imageClassName="p-2 scale-[1.08]"
                      />
                      <div className="p-4">
                        <h4 className="text-base font-black leading-tight text-slate-950">{c.label}</h4>
                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                          Medida fija, lista para cotizar.
                        </p>
                      </div>
                      <span
                        className={`absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                          active
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-300 bg-white/90 text-transparent"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {categoria && (
              <SectionCard
                step="02"
                title="Seleccioná calibre"
                description="El calibre disponible depende de la categoría elegida."
              >
                {calibresDisponibles.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {calibresDisponibles.map((c) => (
                      <OptionButton
                        key={c}
                        active={calibre === c}
                        onClick={() => {
                          setCalibre(c);
                          setMedida("");
                          setColor("");
                          setError("");
                        }}
                      >
                        <span className="block text-lg">{c}</span>
                        <span className="mt-1 block text-xs font-bold opacity-70">Calibre disponible</span>
                      </OptionButton>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                    No hay calibres cargados para esta categoría.
                  </p>
                )}
              </SectionCard>
            )}

            {calibre && medidasDisponibles.length > 0 && (
              <SectionCard
                step="03"
                title="Elegí la medida"
                description="Seleccioná una medida fija disponible para esta chapa."
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {medidasDisponibles.map((m) => (
                    <OptionButton
                      key={m}
                      active={medida === m}
                      onClick={() => {
                        setMedida(m);
                        if (!isPrepintada) setColor("");
                        setError("");
                      }}
                    >
                      <span className="block text-base">{MEDIDA_LABELS[m] ?? m}</span>
                      <span className="mt-1 block text-xs font-bold opacity-70">Medida fija</span>
                    </OptionButton>
                  ))}
                </div>
              </SectionCard>
            )}

            {isPrepintada && medida && (
              <SectionCard
                step="04"
                title="Elegí el color"
                description="El color no cambia la lógica del cálculo; solo identifica la terminación."
              >
                <div className="flex flex-wrap gap-3">
                  {COLORES_PREPINTADA.map((c) => {
                    const active = color === c;
                    const hex = getColorHex(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setColor(c);
                          setError("");
                        }}
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
              </SectionCard>
            )}

            {medida && (!isPrepintada || color) && (
              <SectionCard
                step={isPrepintada ? "05" : "04"}
                title="Definí la cantidad"
                description="Indicá cuántas unidades querés sumar a la cotización."
              >
                <div className="grid gap-5 md:grid-cols-[1fr_0.9fr] md:items-center">
                  <div>
                    <p className="text-sm font-black text-slate-800">Producto seleccionado</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{buildDescripcion()}</p>
                    {cantidad > 50 && (
                      <p className="mt-2 text-sm font-bold text-amber-700">
                        Para cantidades grandes te recomendamos consultar con ventas.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      −
                    </button>

                    <div className="text-center">
                      <input
                        type="number"
                        min={1}
                        max={300}
                        value={cantidad}
                        onChange={(e) => {
                          const next = Math.max(1, Math.min(300, Number(e.target.value) || 1));
                          setCantidad(next);
                        }}
                        className="w-24 bg-transparent text-center text-3xl font-black text-slate-950 outline-none"
                      />
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        {cantidad === 1 ? "unidad" : "unidades"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCantidad((c) => Math.min(300, c + 1))}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-black text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </SectionCard>
            )}

            {mostrarMensajeNoExiste && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                No existe precio para esta combinación.
              </div>
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
                <ProductImage
                    src={selectedImage}
                    alt={catLabel || "Chapa estándar"}
                    className="mb-5 h-48"
                    imageClassName="p-3 scale-[1.06]"
                  />

                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow label="Categoría" value={catLabel || "—"} />
                  <SummaryRow label="Calibre" value={calibre || "—"} />
                  <SummaryRow label="Medida" value={selectedMedidaLabel} />
                  {isPrepintada && <SummaryRow label="Color" value={color || "—"} />}
                  <SummaryRow
                    label="Cantidad"
                    value={`${cantidad} ${cantidad === 1 ? "unidad" : "unidades"}`}
                  />
                </div>

                <div className="mt-4 space-y-1 border-b border-slate-100 pb-4">
                  <SummaryRow
                    label="Precio unitario"
                    value={preview ? formatARS(preview.precioUnitarioARS) : "—"}
                  />
                  <SummaryRow
                    label="Subtotal"
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
                  {cantidad > 1 ? `Agregar ${cantidad} unidades` : "Agregar al carrito"}
                </button>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <Layers3 className="mb-2 h-5 w-5 text-emerald-700" />
                    <p className="text-xs font-black text-slate-800">Medidas fijas</p>
                    <p className="text-xs font-medium text-slate-500">Elegí una medida cargada.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <PackageCheck className="mb-2 h-5 w-5 text-emerald-700" />
                    <p className="text-xs font-black text-slate-800">Precio actualizado</p>
                    <p className="text-xs font-medium text-slate-500">Según tu selección.</p>
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
