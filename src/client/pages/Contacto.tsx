import { useEffect } from "react";
import { Clock, ExternalLink, Facebook, Instagram, MapPin, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";

const WA_NUMBER = "5493815589875";
const DISPLAY_PHONE = "381-558-9875";
const MAPS_LINK = "https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5";
const FB_LINK = "https://www.facebook.com/Giacosaelio";
const IG_LINK = "https://www.instagram.com/giacosamateriales";

const HORARIOS = [
  { dia: "Lunes a Viernes", hora: "8:00-13:00 y 14:00-17:00" },
  { dia: "Sábado", hora: "8:30-12:30" },
  { dia: "Domingo", hora: "Cerrado" },
];

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    name: "Giacosa Elio - Corralón y Materiales para la Construcción",
    telephone: "+54 9 381 558-9875",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Batalla de Suipacha 482",
      addressLocality: "San Miguel de Tucumán",
      addressRegion: "Tucumán",
      addressCountry: "AR",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "08:30", closes: "12:30" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+54 9 381 558-9875",
      areaServed: "AR",
      availableLanguage: "Spanish",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function Contacto() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);
  function openWA(msg: string) {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,140,69,0.12),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#fff_55%,#f6f7fb_100%)] text-slate-950">
      <JsonLd />
      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 lg:py-12">
        <div className="rounded-[30px] border border-emerald-100 bg-emerald-50/70 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-emerald-700">Contacto Giacosa Elio</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Hablemos de tu cotización</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Contactá a Giacosa Elio – Corralón y Materiales para la Construcción en San Miguel de Tucumán. Te ayudamos con chapas para techo, bobinas, chapas estándar y consultas de obra.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => openWA("Hola Giacosa Elio, quiero consultar por una cotización de chapas y materiales.")} className="inline-flex items-center gap-3 rounded-full bg-emerald-700 px-7 py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(0,140,69,0.24)] transition hover:bg-emerald-800">
              <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
            </button>
            <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700">
              <MapPin className="h-5 w-5" /> Ver ubicación
            </a>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">WhatsApp comercial</p>
                  <h2 className="mt-1 text-2xl font-black">{DISPLAY_PHONE}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Canal recomendado para consultas, confirmación de cotizaciones, coordinación de productos y atención comercial.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => openWA("Hola, quiero cotizar chapas para techo.")} className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-800">Cotizar chapas</button>
                    <button onClick={() => openWA("Hola, quiero consultar por bobinas de acero.")} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">Consultar bobinas</button>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Dirección</p>
                  <h2 className="mt-1 text-xl font-black">Batalla de Suipacha 482</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">San Miguel de Tucumán, Tucumán. Atención local para clientes de la ciudad y alrededores.</p>
                  <a href={MAPS_LINK} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                    Abrir en Google Maps <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          </div>

          <aside className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">Horarios de atención</p>
              <h2 className="mt-2 text-2xl font-black">Visitá o escribinos</h2>
              <div className="mt-6 space-y-3">
                {HORARIOS.map((item) => (
                  <div key={item.dia} className="flex items-center justify-between gap-4 rounded-2xl bg-white/7 px-4 py-3">
                    <span className="font-bold text-slate-100">{item.dia}</span>
                    <span className="text-sm text-slate-300">{item.hora}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href={FB_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                <Facebook className="h-5 w-5 text-blue-600" /> Facebook
              </a>
              <a href={IG_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
                <Instagram className="h-5 w-5 text-pink-600" /> Instagram
              </a>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <p className="text-sm leading-6 text-slate-700">Las cotizaciones están sujetas a disponibilidad de stock y confirmación comercial al momento del pedido.</p>
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
