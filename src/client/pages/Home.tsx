import { useState, useRef } from "react";
import { Precios } from "@/lib/precios";

type ProductType = "chapa_perfilada" | "bobina" | "chapa_estandar";

interface Props {
  precios?: Precios;
  onSelect: (type: ProductType) => void;
}

interface GoogleReview {
  author_name: string;
  badge?: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

const REVIEWS: GoogleReview[] = [
  {
    author_name: "Pedro Villalba",
    badge: "Local Guide",
    rating: 5,
    text: "Ecxelente atencion, precio y variedad de productos!!!",
    relative_time_description: "Hace un mes",
  },
  {
    author_name: "La Pérez",
    rating: 5,
    text: "Excelente atención.... Me orientaron en la compra.",
    relative_time_description: "Hace un mes",
  },
  {
    author_name: "Alejandro Romano",
    badge: "Local Guide",
    rating: 5,
    text: "EXCELENTE ATENCIÓN UN PERSONAL DE PRIMERA",
    relative_time_description: "Hace 2 meses",
  },
  {
    author_name: "Patricia Nader",
    badge: "Local Guide",
    rating: 5,
    text: "Precios muy competitivos. Excelente atención y asesoramiento",
    relative_time_description: "Hace 7 meses",
  },
];

const GOOGLE_REVIEW_URL = "https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5";
const FACEBOOK_URL = "https://www.facebook.com/Giacosaelio";

const PRODUCTOS = [
  {
    type: "chapa_perfilada" as ProductType,
    emoji: "🏠",
    title: "Chapas para Techo",
    subtitle: "Sinusoidal · Trapezoidal",
    desc: "Cortadas a medida desde bobina. Cincalum y prepintadas en calibres 24 y 27.",
    color: "#008C45",
    bg: "#f0faf4",
    border: "#c3e8d4",
  },
  {
    type: "bobina" as ProductType,
    emoji: "🔩",
    title: "Bobinas de Acero",
    subtitle: "Calibres 22 · 25 · 27",
    desc: "Vendidas por metro. Ideal para fabricación de perfiles y piezas especiales.",
    color: "#1a1a2e",
    bg: "#f5f5f7",
    border: "#d5d5dc",
  },
  {
    type: "chapa_estandar" as ProductType,
    emoji: "🏭",
    title: "Chapas Estándar",
    subtitle: "Estampadas · Lisas · LAF",
    desc: "Medidas fijas. Negra, galvanizada y prepintada. Para usos estructurales y decorativos.",
    color: "#CD212A",
    bg: "#fdf0f0",
    border: "#f4c8ca",
  },
];

function Stars({ rating = 5, size = "w-4 h-4" }: { rating?: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const fill = s <= Math.round(rating) ? "#FACC15" : "#E5E7EB";
        return (
          <svg key={s} className={`${size} flex-shrink-0`} viewBox="0 0 20 20" fill={fill}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
          </svg>
        );
      })}
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-label="Google">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const initial = review.author_name.charAt(0).toUpperCase();
  const colors = ["#4285F4", "#34A853", "#EA4335", "#FBBC05", "#8E24AA", "#0097A7"];
  const colorIndex = review.author_name.charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
          style={{ background: bg }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{review.author_name}</p>
          <p className="text-xs text-gray-400">
            {review.badge ? `${review.badge} · ` : ""}{review.relative_time_description}
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <GoogleLogo />
        </div>
      </div>
      <Stars rating={review.rating} />
      <p className="text-sm text-gray-600 mt-2 leading-relaxed">"{review.text}"</p>
    </div>
  );
}

export default function Home({ precios, onSelect }: Props) {
  const productsRef = useRef<HTMLDivElement>(null);
  const financiacionRef = useRef<HTMLDivElement>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const tarjetas = precios?.formas_pago ?? [];

  const mejorDto = tarjetas.length > 0
    ? Math.abs(Math.min(...tarjetas.flatMap((t) => t.cuotas).map((c) => c.porcentaje)))
    : 15;

  const cuotasSinRecargo = tarjetas.length > 0
    ? Math.max(...tarjetas.flatMap((t) => t.cuotas).filter((c) => c.porcentaje === 0).map((c) => parseInt(c.key, 10)))
    : 12;

  const selectedTarjeta = tarjetas.find((t) => t.id === selectedCard);

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="text-center pt-12 pb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-2">
          Materiales de construcción<br />
          <span style={{ color: "#008C45" }}>al mejor precio de Tucumán</span>
        </h1>
        <h2 className="text-sm font-semibold text-gray-500 mb-1">Giacosa Elio — Corralón y Materiales para la Construcción</h2>
        <p className="text-sm text-gray-400 mb-2">
          Cotizá al instante. Sin turno, sin espera.
        </p>
        <p className="text-xs text-gray-400 mb-7">
          📍 Batalla de Suipacha 482, San Miguel de Tucumán
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1"><span>⚡</span> Precio inmediato</span>
          <span className="text-gray-200">|</span>
          <span className="flex items-center gap-1"><span>💳</span> Hasta 20% OFF pagando en efectivo o transferencia</span>
          <span className="text-gray-200">|</span>
          <span className="flex items-center gap-1"><span>⭐</span> 4.4 en Google</span>
        </div>
      </section>

      {/* ── BANNER DESCUENTO ─────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ background: "linear-gradient(135deg, #005c2e 0%, #008C45 100%)" }}
      >
        <div>
          <p className="text-white font-bold text-base mb-0.5">
            💳 Hasta 20% de descuento
          </p>
          <p className="text-green-200 text-sm">
            Hasta {cuotasSinRecargo} cuotas sin interés
          </p>
        </div>
        <button
          onClick={() => scrollTo(financiacionRef)}
          className="flex-shrink-0 px-4 py-2 rounded-xl bg-white text-green-800 font-bold text-sm hover:bg-green-50 transition-colors"
        >
          Ver financiación
        </button>
      </div>

      {/* ── PRODUCTOS ────────────────────────────────── */}
      <div ref={productsRef} className="scroll-mt-20 mb-10">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
          ¿Qué querés cotizar?
        </p>
        <div className="flex flex-col gap-4">
          {PRODUCTOS.map(({ type, emoji, title, subtitle, desc, color, bg, border }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="card-hover flex items-start gap-5 p-5 sm:p-6 rounded-2xl border-2 text-left w-full group"
              style={{ backgroundColor: bg, borderColor: border }}
            >
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                style={{ background: color + "18", border: `1.5px solid ${color}30` }}
              >
                {emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-gray-900 text-base">{title}</p>
                  <span className="text-lg transition-transform group-hover:translate-x-1 flex-shrink-0" style={{ color }}>→</span>
                </div>
                <p className="text-xs font-semibold mt-0.5 mb-1.5" style={{ color }}>{subtitle}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── FINANCIACIÓN ─────────────────────────────── */}
      {tarjetas.length > 0 && (
        <section ref={financiacionRef} className="scroll-mt-20 mb-10 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 text-lg mb-0.5">Formas de pago</h2>
            <p className="text-sm text-gray-400">Seleccioná tu tarjeta para ver las cuotas disponibles</p>
          </div>

          <div className="px-5 py-4 flex flex-wrap gap-2 border-b border-gray-100">
            {tarjetas.map((t) => {
              const best = Math.min(...t.cuotas.map((c) => c.porcentaje));
              const hasDcto = best < 0;
              const isSelected = selectedCard === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedCard(isSelected ? null : t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                    isSelected
                      ? "border-gray-800 bg-gray-800 text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {t.label}
                  {hasDcto && (
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isSelected ? "bg-green-500 text-white" : "bg-green-100 text-green-700"}`}>
                      {Math.abs(best)}% OFF
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedTarjeta ? (
            <div className="px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{selectedTarjeta.label}</p>
              <div className="flex flex-col gap-2">
                {selectedTarjeta.cuotas.filter((c) => c.activo).map((c) => {
                  const dto = c.porcentaje;
                  const esDescuento = dto < 0;
                  const esRecargo = dto > 0;
                  return (
                    <div
                      key={c.key}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
                        esDescuento ? "bg-green-50 border border-green-100" : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-800">{c.label}</span>
                      {dto === 0 ? (
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Sin recargo</span>
                      ) : esDescuento ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">{Math.abs(dto)}% de descuento</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">+{dto}% recargo</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">Precios con IVA incluido. Los descuentos se aplican al total de la cotización.</p>
            </div>
          ) : (
            <div className="px-5 py-5 text-center text-sm text-gray-400">
              Seleccioná una tarjeta para ver las opciones de pago
            </div>
          )}
        </section>
      )}

      {/* ── RESEÑAS GOOGLE ───────────────────────────── */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Lo que dicen nuestros clientes</p>
          <div className="flex items-center justify-center gap-2">
            <Stars rating={4.4} />
            <span className="font-bold text-gray-800 text-sm">4.4</span>
            <span className="text-xs text-gray-400">en Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.author_name} review={r} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 transition-colors bg-white"
          >
            <GoogleLogo />
            Dejá tu reseña en Google
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ background: "#1877F2" }}
          >
            <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
            Seguinos en Facebook
          </a>
        </div>
      </section>

      {/* ── INFO STRIP ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 text-center mb-10">
        {[
          { icon: "⚡", label: "Precio inmediato" },
          { icon: "📄", label: "Descargá la imagen" },
          { icon: "💬", label: "Confirmá por WhatsApp" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <p className="text-2xl mb-1">{item.icon}</p>
            <p className="text-xs text-gray-500 font-medium leading-tight">{item.label}</p>
          </div>
        ))}
      </div>

      {/* ── GUÍA DE COMPRA ───────────────────────────── */}
      <div className="mb-10">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Guía de compra</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-lg mb-2">🏠</p>
            <p className="font-bold text-gray-800 text-sm mb-2">Tipos de chapa</p>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li><span className="font-semibold text-gray-700">Sinusoidal:</span> uso general en techos y paredes.</li>
              <li><span className="font-semibold text-gray-700">Trapezoidal:</span> mayor resistencia estructural.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-lg mb-2">🔧</p>
            <p className="font-bold text-gray-800 text-sm mb-2">Usos comunes</p>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li><span className="font-semibold text-gray-700">Techos:</span> chapas perfiladas cincalum o prepintadas.</li>
              <li><span className="font-semibold text-gray-700">Cerramientos:</span> sinusoidal o lisa galvanizada.</li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-lg mb-2">📏</p>
            <p className="font-bold text-gray-800 text-sm mb-2">Calibres</p>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li><span className="font-semibold text-gray-700">Calibre 24:</span> el más resistente y grueso.</li>
              <li><span className="font-semibold text-gray-700">Calibre 27:</span> más liviano y económico.</li>
              <li className="text-gray-400 italic">Mayor número = menor espesor.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Preguntas frecuentes</p>
        <div className="flex flex-col gap-3">
          {[
            {
              q: "¿Dónde puedo retirar el material?",
              a: "Podés retirar el material en nuestro depósito ubicado en Batalla de Suipacha 482, San Miguel de Tucumán, zona centro.",
            },
            {
              q: "¿Qué más venden?",
              a: "Además de chapas y bobinas, trabajamos con perfiles C, caños estructurales, placas de Durlock y otros materiales para la construcción. Consultá disponibilidad en nuestro local o por WhatsApp.",
            },
            {
              q: "¿Puedo comprar en metros?",
              a: "Las chapas perfiladas se venden por unidad y se miden en pies. Las bobinas, en cambio, se venden directamente por metro.",
            },
            {
              q: "¿Cuál es la diferencia entre galvanizada, cincalum y prepintada?",
              a: "• Galvanizada: más económica, ideal para galpones o estructuras secundarias.\n• Cincalum: Debido a su baño en aluminio, tiene una mayor durabilidad y gran resistencia a la corrosion, siendo excelente para techos expuestos .\n• Prepintada: Con una pintura epoxi, llevandola a ser la mas durarera y con su terminación estética, es ideal para viviendas donde la apariencia importa.",
            },
          ].map(({ q, a }) => (
            <details key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm group">
              <summary className="px-5 py-4 cursor-pointer font-semibold text-sm text-gray-800 flex items-center justify-between select-none list-none">
                {q}
                <span className="text-gray-400 text-lg group-open:rotate-45 transition-transform inline-block leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed whitespace-pre-line">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
