import logoGiacosa from "/logo-giacosa.png";
import { useEffect } from "react";
import { Award, Building2, CheckCircle2, Hammer, MapPin, ShieldCheck, ShoppingCart, Users } from "lucide-react";

type Props = {
  navigateToHomeSection?: (sectionId: string) => void;
};

const COMPANY = {
  name: "Giacosa Elio",
  legalName: "Giacosa Elio - Corralón y Materiales para la Construcción",
  address: "Batalla de Suipacha 482, San Miguel de Tucumán, Tucumán",
  phone: "+54 9 381 558-9875",
  whatsapp: "5493815589875",
  maps: "https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5",
};

function goToCotizador(navigateToHomeSection?: (sectionId: string) => void) {
  if (navigateToHomeSection) {
    navigateToHomeSection("cotizador-categorias");
    return;
  }
  sessionStorage.setItem("scrollToCotizadorCategorias", "1");
  window.location.href = "/";
}

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    name: COMPANY.legalName,
    alternateName: "Giacosa Elio Corralón",
    description:
      "Corralón y materiales para la construcción en San Miguel de Tucumán. Venta y cotización de chapas para techo, bobinas de acero, chapas estándar, materiales de construcción y atención local.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Batalla de Suipacha 482",
      addressLocality: "San Miguel de Tucumán",
      addressRegion: "Tucumán",
      addressCountry: "AR",
    },
    telephone: COMPANY.phone,
    areaServed: ["San Miguel de Tucumán", "Tucumán", "Argentina"],
    url: typeof window !== "undefined" ? window.location.origin : undefined,
    sameAs: [COMPANY.maps],
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chapas para techo" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Bobinas de acero" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Chapas estándar" } },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function Historia({ navigateToHomeSection }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  const values = [
    "Atención local en Tucumán",
    "Cotización online de chapas y bobinas",
    "Precios actualizados",
    "Acompañamiento para obras, techos y cerramientos",
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,140,69,0.13),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#ffffff_52%,#f6f7fb_100%)] text-slate-950">
      <JsonLd />

      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[30px] border border-emerald-100 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid items-stretch lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative bg-[#101820] p-8 text-white sm:p-10 lg:p-12">
              <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_10%,rgba(0,140,69,0.55),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_40%)]" />
              <div className="relative">
                <div className="mb-8 inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl">
                  <img src={logoGiacosa} alt="Logo de Giacosa Elio" className="h-14 w-auto" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Corralón en Tucumán</p>
                    <p className="text-lg font-black text-slate-950">Giacosa Elio</p>
                  </div>
                </div>

                <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-emerald-300">Nuestra historia</p>
                <h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                  Más de 65 años acompañando obras en Tucumán
                </h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
                  Giacosa Elio es un corralón y proveedor de materiales para la construcción con atención local en San Miguel de Tucumán. Atendemos obras, profesionales y particulares, ofreciendo soluciones para todo tipo de proyectos.
                </p>

                <button
                  type="button"
                  onClick={() => goToCotizador(navigateToHomeSection)}
                  className="mt-8 inline-flex items-center gap-3 rounded-full bg-emerald-600 px-7 py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(0,140,69,0.28)] transition hover:bg-emerald-700"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Cotizar chapas y bobinas
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
              <div className="grid gap-4 sm:grid-cols-2">
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <Award className="mb-4 h-8 w-8 text-emerald-700" />
                  <h2 className="text-xl font-black">Trayectoria comercial</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Décadas de trabajo en el rubro de materiales, atendiendo familias, constructores, techistas y empresas de Tucumán.
                  </p>
                </article>
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <Hammer className="mb-4 h-8 w-8 text-emerald-700" />
                  <h2 className="text-xl font-black">Materiales para obra</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Chapas para techo, bobinas, chapas estándar y productos para construcción, techos y cerramientos.
                  </p>
                </article>
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <ShieldCheck className="mb-4 h-8 w-8 text-emerald-700" />
                  <h2 className="text-xl font-black">Cotización clara</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    El cotizador online permite revisar medidas, cantidades y formas de pago antes de confirmar el pedido.
                  </p>
                </article>
                <article className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <MapPin className="mb-4 h-8 w-8 text-emerald-700" />
                  <h2 className="text-xl font-black">Ubicación local</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Atención en Batalla de Suipacha 482, San Miguel de Tucumán, con asesoramiento por WhatsApp.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-7">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">Por qué elegirnos</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Un corralón pensado para comprar mejor</h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              La experiencia local se combina con herramientas digitales para reducir consultas repetidas, acelerar presupuestos y ayudar a decidir con información completa.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-700" />
                <span className="text-sm font-bold text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">Giacosa Elio en Tucumán</p>
              <h2 className="mt-2 text-2xl font-black">Materiales para construcción, techos y cerramientos</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                Esta página ayuda a clientes y buscadores a identificar a Giacosa Elio como corralón en San Miguel de Tucumán, especializado en cotización de chapas para techo, bobinas de acero, chapas estándar y materiales para obra.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={COMPANY.maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                <Building2 className="h-4 w-4" /> Ver ubicación
              </a>
              <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-800">
                <Users className="h-4 w-4" /> Hablar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
