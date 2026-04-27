import {
  ArrowRight,
  Building2,
  FileText,
  Phone,
  Star,
  Facebook as FacebookIcon,
} from "lucide-react";
import { Precios } from "@/lib/precios";
import React from "react";

// ——— RUTAS DE IMÁGENES (editá solo estos paths) ———
const heroImage = "/images/hero/hero-chapas.png";

const productImages = {
  chapasTecho: "/images/productos/chapas-techo.png",
  bobinas: "/images/productos/bobinas.png",
  chapasEstandar: "/images/productos/chapas-estandar.png",
};

const paymentLogos = {
  efectivo: "/images/pagos/efectivo.png",
  visa: "/images/pagos/visa.png",
  mastercard: "/images/pagos/mastercard.png",
  amex: "/images/pagos/amex.png",
  cabal: "/images/pagos/cabal.png",
  naranja: "/images/pagos/naranja.png",
  titanio: "/images/pagos/titanio.png",
  cencosud: "/images/pagos/cencosud.png",
  sol: "/images/pagos/sol.png",
  credicash: "/images/pagos/credicash.png",
  sucredito: "/images/pagos/sucredito.png",
} as const;

type ProductType = "chapa_perfilada" | "bobina" | "chapa_estandar";

interface Props {
  precios?: Precios;
  onSelect: (type: ProductType) => void;
  onOpenHistoria?: () => void;
  onOpenInformacion?: () => void;
  onOpenContacto?: () => void;
  navigateToHomeSection?: (sectionId: string) => void;
}

const GOOGLE_LINK = "https://www.google.com/search?q=Giacosa+Elio+Tucuman";
const FACEBOOK_LINK = "https://www.facebook.com/giacosaelio";

function collectNumbers(value: unknown): number[] {
  if (typeof value === "number" && Number.isFinite(value)) return [value];

  if (typeof value === "string") {
    const normalized = Number(
      value
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    );
    return Number.isFinite(normalized) ? [normalized] : [];
  }

  if (Array.isArray(value)) return value.flatMap(collectNumbers);

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(collectNumbers);
  }

  return [];
}

function getMinValue(value: unknown): number | null {
  const numbers = collectNumbers(value).filter((n) => n >= 1000);

  if (!numbers.length) return null;

  return Math.min(...numbers);
}

function formatARS(value: number | null): string {
  if (value == null || !Number.isFinite(value) || value < 1000) return "$X.XXX";

  const rounded = Math.round(value / 1000) * 1000;

  return `$${new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded)}`;
}
const IVA = 1.21;

function toARS(precios: Precios | undefined, precioUSD: number | null): number | null {
  if (!precios || precioUSD == null || !Number.isFinite(precioUSD)) return null;
  if (!precios.dolar || !Number.isFinite(precios.dolar)) return null;

  return precioUSD * precios.dolar * IVA;
}

function minFromRecord(record: Record<string, number> | undefined): number | null {
  if (!record) return null;

  const values = Object.values(record).filter((n) => Number.isFinite(n) && n > 0);
  if (!values.length) return null;

  return Math.min(...values);
}

function minFromBobinasVariantes(
  variantes: Precios["bobinas_variantes"] | undefined
): number | null {
  if (!variantes?.length) return null;

  const values = variantes
    .map((v) => v.precio)
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!values.length) return null;

  return Math.min(...values);
}

function minFromChapasEstandar(
  data: Precios["chapas_estandar"] | undefined
): number | null {
  if (!data) return null;

  const values = Object.values(data)
    .flatMap((grupo) => Object.values(grupo))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!values.length) return null;

  return Math.min(...values);
}

const benefits = [
  { label: "20% OFF", desc: "en efectivo" },
  { label: "12 cuotas", desc: "opciones disponibles" },
  { label: "Precios", desc: "actualizados hoy" },
  { label: "Cortes", desc: "a medida" },
];

type PaymentDisplayItem = {
  label: string;
  path: string | null;
  logoClassName?: string;
};

const paymentDisplay: PaymentDisplayItem[] = [
  { label: "Efectivo", path: paymentLogos.efectivo },
  { label: "Visa", path: paymentLogos.visa },
  { label: "Mastercard", path: paymentLogos.mastercard, logoClassName: "max-h-[43px] max-w-[116px]" },
  { label: "Naranja X", path: paymentLogos.naranja },
  { label: "American Express", path: paymentLogos.amex, logoClassName: "max-h-[43px] max-w-[116px]" },
  { label: "Cabal", path: paymentLogos.cabal },
  { label: "Tarjeta Titanio", path: paymentLogos.titanio },
  { label: "Cencosud", path: paymentLogos.cencosud },
  { label: "Sol", path: paymentLogos.sol },
  { label: "Credicash", path: paymentLogos.credicash },
  { label: "Sucrédito", path: paymentLogos.sucredito },
];

type CardFallback = {
  bg: string;
  line1: string;
  line2: string;
};

const cards = [
  {
    key: "chapa_perfilada" as const,
    img: productImages.chapasTecho,
    alt: "Chapas para techo sinusoidales y trapezoidales",
    fallback: {
      bg: "bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950",
      line1: "Chapas para techo",
      line2: "Imagen no disponible",
    } satisfies CardFallback,
    title: "Chapas para Techo",
    subtitle: (
      <span className="text-[15px] font-semibold text-emerald-700">
        Sinusoidal · Trapezoidal
      </span>
    ),
    desc:
      "Cortadas a medida desde bobina. Galvanizadas, Cincalum y prepintadas en calibres 24 y 27. Pedí el largo que necesitás.",
  },
  {
    key: "bobina" as const,
    img: productImages.bobinas,
    alt: "Bobinas de acero galvanizado",
    fallback: {
      bg: "bg-gradient-to-br from-zinc-900 via-slate-900 to-emerald-950",
      line1: "Bobinas de acero",
      line2: "Imagen no disponible",
    } satisfies CardFallback,
    title: "Bobinas de Acero",
    subtitle: (
      <span className="text-[15px] font-semibold text-emerald-700">
        Calibres 22 · 25 · 27
      </span>
    ),
    desc:
      "Para fabricación de perfiles, zinguería y piezas especiales. Venta por metro, consultá según tu necesidad.",
  },
  {
    key: "chapa_estandar" as const,
    img: productImages.chapasEstandar,
    alt: "Chapas estándar en medidas fijas",
    fallback: {
      bg: "bg-gradient-to-br from-slate-800 via-zinc-900 to-slate-950",
      line1: "Chapas estándar",
      line2: "Imagen no disponible",
    } satisfies CardFallback,
    title: "Chapas Estándar",
    subtitle: (
      <span className="text-[15px] font-semibold text-red-600">
        Estampadas · Lisas · LAF · LAC
      </span>
    ),
    desc:
      "Medidas fijas: negras estampadas, lisas negras LAF/LAC, galvanizadas y prepintadas. Consultá por stock disponible.",
  },
];

function CardImage({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: CardFallback;
}) {
  const [failed, setFailed] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative flex h-full w-full flex-col items-center justify-center px-4 text-center text-white ${fallback.bg}`}
        aria-hidden={failed ? undefined : true}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)",
          }}
        />
        <p className="relative z-[1] text-sm font-bold tracking-tight">{fallback.line1}</p>
        <p className="relative z-[1] mt-1 text-xs font-medium text-white/75">{fallback.line2}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
      loading="lazy"
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function HeroImageLayer() {
  const [failed, setFailed] = React.useState(false);

  if (!heroImage || failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#17202b] via-[#0c1118] to-[#0f2a24]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 48px)",
          }}
        />
      </div>
    );
  }

  return (
    <img
      src={heroImage}
      alt="Chapas, bobinas y materiales para construcción en Tucumán"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: "72% center" }}
      loading="eager"
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function PaymentLogoBox({
  label,
  path,
  logoClassName,
}: {
  label: string;
  path: string | null;
  logoClassName?: string;
}) {
  const [imgFailed, setImgFailed] = React.useState(() => path == null || path === "");
  const showImage = Boolean(path) && !imgFailed;

  return (
    <div
      className="flex h-[78px] w-[138px] flex-shrink-0 select-none items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
      title={label}
    >
      {showImage ? (
        <img
          src={path ?? undefined}
          alt=""
          role="presentation"
          className={`h-auto max-h-[40px] w-auto max-w-[112px] object-contain ${logoClassName ?? ""}`}
          loading="lazy"
          draggable={false}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="text-center text-[13px] font-semibold leading-tight tracking-tight text-slate-600">
          {label}
        </span>
      )}
    </div>
  );
}

function priceBadge(price: number | null, unit: "/ metro" | "" = "/ metro") {
  return (
    <span className="inline-flex select-none items-center gap-1 rounded-full border border-emerald-200 bg-white px-4 py-2 text-base font-bold tracking-tight text-emerald-700 shadow-sm">
      Desde {formatARS(price)}{unit ? ` ${unit}` : ""}
    </span>
  );
}

export default function Home({
  precios,
  onSelect,
  onOpenHistoria,
  onOpenInformacion,
  onOpenContacto,
  navigateToHomeSection,
}: Props) {
  const LARGO_REFERENCIA_CHAPA_TECHO_MTS = 13;

  const minTechoUnidad = toARS(precios, minFromRecord(precios?.chapas_perfiladas));
  const minTecho = minTechoUnidad ? minTechoUnidad / LARGO_REFERENCIA_CHAPA_TECHO_MTS : null;
  
  const minBobina = toARS(precios, minFromBobinasVariantes(precios?.bobinas_variantes));
  const minChapaEstandar = toARS(precios, minFromChapasEstandar(precios?.chapas_estandar));

  const goToCategorias = () => {
    if (navigateToHomeSection) {
      navigateToHomeSection("cotizador-categorias");
      return;
    }

    const el = document.getElementById("cotizador-categorias") ?? document.getElementById("productos-home");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f7fb]">
      <section className="relative isolate min-h-[620px] overflow-hidden border-b border-slate-900 bg-[#071018] lg:min-h-[700px]">
        <div className="absolute inset-y-0 right-0 w-full lg:w-[76%]">
          <HeroImageLayer />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_28%,rgba(0,140,69,0.28),transparent_34%),linear-gradient(90deg,#071018_0%,#071018_27%,rgba(7,16,24,0.94)_41%,rgba(7,16,24,0.66)_57%,rgba(7,16,24,0.20)_77%,rgba(7,16,24,0.10)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#071018] via-[#071018]/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#071018]/80 via-[#071018]/30 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[620px] max-w-[1600px] flex-col px-4 sm:px-8 lg:min-h-[700px] lg:px-12">
          <div className="flex flex-wrap justify-center gap-3 border-b border-white/10 py-4 lg:justify-center">
            {benefits.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-1.5 text-[11px] font-bold text-white/75 shadow-sm backdrop-blur sm:text-xs"
              >
                <strong className="mr-1.5 font-black uppercase tracking-tight text-emerald-300">{b.label}</strong>
                {b.desc}
              </span>
            ))}
          </div>

          <div className="flex flex-1 items-center py-14 lg:py-20">
            <div className="max-w-[740px]">
              <div className="mb-5 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Cotización rápida
              </div>

              <h1 className="max-w-[860px] text-4xl font-black leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-[78px]">
                  Cotizá chapas y bobinas
                  <span className="block text-emerald-400">al instante en</span>
                  <span className="block text-emerald-400">Tucumán</span>
                </h1>

              <p className="mt-6 max-w-[620px] text-base font-medium leading-7 text-white/78 sm:text-lg">
                Elegí el producto, configurá medidas y obtené tu cotización en pocos pasos.
                Trabajamos chapas para techo, bobinas, chapas estándar y materiales para obra.
              </p>

              <ul className="mt-8 grid max-w-[640px] gap-3 text-sm font-semibold text-white/88 sm:grid-cols-2 sm:text-[15px]">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">✓</span>
                  Resultado inmediato
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">✓</span>
                  Atención local
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">✓</span>
                  Pagos y cuotas
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">✓</span>
                  Cortes a medida
                </li>
              </ul>

              <button
                type="button"
                onClick={goToCategorias}
                className="mt-10 inline-flex items-center gap-3 rounded-full bg-emerald-600 px-8 py-4 text-sm font-black uppercase tracking-[0.02em] text-white shadow-[0_18px_50px_rgba(0,140,69,0.28)] transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:px-10 sm:py-5 sm:text-base"
              >
                Ver precios y agregar al carrito
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="productos-home" className="w-full border-b border-slate-200 bg-white">
        <div id="cotizador-categorias" className="mx-auto max-w-[1450px] px-4 py-16 sm:px-8">
          <div className="mb-14 text-center">
            <span className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
              Productos disponibles
            </span>
            <h2 className="mb-1 text-3xl font-extrabold text-slate-900 lg:text-4xl">
              ¿Qué querés cotizar hoy?
            </h2>
            <p className="text-lg text-slate-600">
              Elegí la opción que necesitás y obtené tu precio al instante.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => {
              const price =
              card.key === "chapa_perfilada"
                ? minTecho
                : card.key === "bobina"
                  ? minBobina
                  : minChapaEstandar;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => onSelect(card.key)}
                  className="group relative flex h-full min-h-[420px] flex-col items-stretch overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(40,71,55,0.09)] transition duration-200 outline-none hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(40,71,55,0.15)] focus:z-10 focus:ring-2 focus:ring-emerald-400"
                >
                  <div className="relative h-44 w-full flex-shrink-0 overflow-hidden rounded-t-3xl border-b border-slate-200 bg-[#0f1419]">
                    <CardImage src={card.img} alt={card.alt} fallback={card.fallback} />
                    <span className="absolute right-3 top-3 z-10 rounded-full border border-emerald-600/10 bg-white/90 px-[10px] py-[2.5px] text-xs font-bold text-emerald-700/90 opacity-80 shadow-sm select-none group-hover:opacity-100">
                      {i === 0 ? "Lo más vendido" : i === 1 ? "Usos profesionales" : "Medidas listas"}
                    </span>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col items-center px-7 pb-6 pt-7 text-center">
                    <h3 className="mb-1 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 lg:text-[26px]">
                      {card.title}
                    </h3>
                    <div className="mb-2 w-full">{card.subtitle}</div>
                    <p className="mb-6 flex-1 break-words text-[15px] leading-snug text-slate-600">{card.desc}</p>
                    <div className="mt-auto flex w-full flex-col items-center gap-3 pt-1">
                      {priceBadge(price, card.key === "chapa_estandar" ? "" : "/ metro")}
                      <ArrowRight
                        className="h-5 w-5 text-emerald-500/70 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
                        aria-hidden
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="w-full border-b border-slate-200 bg-[#f6f7fb]">
        <div className="mx-auto max-w-[1450px] px-4 py-16 sm:px-8 lg:py-[74px]">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-extrabold text-slate-900 lg:text-3xl">Formas de pago</h2>
          </div>
          <div className="mb-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            {paymentDisplay.map(({ label, path, logoClassName }) => (
              <PaymentLogoBox key={label} label={label} path={path} logoClassName={logoClassName} />
            ))}
          </div>
          <div className="text-center text-sm font-medium text-slate-600">
            Hasta 12 cuotas sin interés en algunas tarjetas. Consultá condiciones al momento de cotizar.
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1450px] flex-col flex-wrap items-center justify-center gap-3 px-4 py-4 sm:flex-row sm:px-8 lg:justify-between">
          <FooterAction onClick={onOpenHistoria}>
            <Building2 className="h-4 w-4 text-slate-700" strokeWidth={2} />
            <span>Nuestra historia</span>
          </FooterAction>
          <FooterAction onClick={onOpenInformacion}>
            <FileText className="h-4 w-4 text-blue-600" strokeWidth={2} />
            <span>Información</span>
          </FooterAction>
          <FooterAction onClick={onOpenContacto}>
            <Phone className="h-4 w-4 text-emerald-600" strokeWidth={2} />
            <span>Contactanos</span>
          </FooterAction>
          <FooterAction href={GOOGLE_LINK} variant="red">
            <Star className="h-4 w-4" strokeWidth={2.1} />
            <span>Dejá tu reseña en Google</span>
          </FooterAction>
          <FooterAction href={FACEBOOK_LINK} variant="blue">
            <FacebookIcon className="h-4 w-4" strokeWidth={2.1} />
            <span>Seguinos en Facebook</span>
          </FooterAction>
        </div>
      </footer>
    </div>
  );
}

function FooterAction({
  onClick,
  href,
  children,
  variant = "neutral",
}: {
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  variant?: "neutral" | "red" | "blue";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-xs transition select-none focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white";
  const styles =
    variant === "red"
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : variant === "blue"
        ? "border-blue-200 text-blue-600 hover:bg-blue-50"
        : "border-slate-200 text-slate-900 hover:border-emerald-200 hover:bg-emerald-50";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={`${base} ${styles}`}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
