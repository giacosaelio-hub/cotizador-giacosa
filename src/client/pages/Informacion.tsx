import React, { useEffect } from "react";
import { ArrowRight, CheckCircle2, CreditCard, FileText, HelpCircle, MessageCircle, Ruler, ShieldCheck, ShoppingCart, Truck } from "lucide-react";

type Props = {
  navigateToHomeSection?: (sectionId: string) => void;
};

const GREEN = "#008C45";

function goToCotizador(navigateToHomeSection?: (sectionId: string) => void) {
  if (navigateToHomeSection) {
    navigateToHomeSection("cotizador-categorias");
    return;
  }
  sessionStorage.setItem("scrollToCotizadorCategorias", "1");
  window.location.href = "/";
}

function JsonLd() {
  const faqs = [
    {
      q: "¿Qué productos se pueden cotizar online en Giacosa Elio?",
      a: "Se pueden cotizar chapas para techo, bobinas de acero y chapas estándar, con medidas, cantidades y forma de pago. También se comercializan tubos estructurales, caños estructurales, tornillos, autoperforantes, aislantes y otros materiales de construcción.",
    },
    {
      q: "¿Los precios del cotizador son finales?",
      a: "Los precios se calculan al instante, pero quedan sujetos a disponibilidad de stock y confirmación comercial.",
    },
    {
      q: "¿Dónde está Giacosa Elio?",
      a: "Giacosa Elio está en Batalla de Suipacha 482, San Miguel de Tucumán, Tucumán.",
    },
  ];
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function InfoCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_14px_44px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:border-emerald-200">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">{icon}</div>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-3 text-sm leading-7 text-slate-600">{children}</div>
    </article>
  );
}

export default function Informacion({ navigateToHomeSection }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const pasos = [
    { icon: <ShoppingCart className="h-5 w-5" />, title: "Elegís el producto", text: "Seleccioná chapas para techo, bobinas de acero o chapas estándar. Para otros materiales, consultá por WhatsApp." },
    { icon: <Ruler className="h-5 w-5" />, title: "Definís medidas", text: "Indicá calibre, largo, ancho, metros o cantidad según el producto." },
    { icon: <CreditCard className="h-5 w-5" />, title: "Elegís forma de pago", text: "El total se actualiza según efectivo, transferencia, tarjeta y cuotas disponibles." },
    { icon: <FileText className="h-5 w-5" />, title: "Confirmás cotización", text: "La cotización se genera y llega al equipo comercial para avanzar con la venta." },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,140,69,0.13),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#fff_55%,#f6f7fb_100%)] text-slate-950">
      <JsonLd />
      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-8 lg:py-12">
        <div className="rounded-[30px] border border-emerald-100 bg-emerald-50/70 p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-emerald-700">Información útil</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Cómo comprar y cotizar en Giacosa Elio</h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Información clara para cotizar chapas, bobinas y materiales de construcción en San Miguel de Tucumán. Esta guía ayuda a entender productos, medidas, pago, confirmación y otros insumos disponibles como tubos estructurales, caños estructurales, tornillos, autoperforantes y aislantes.
          </p>
          <button onClick={() => goToCotizador(navigateToHomeSection)} className="mt-7 inline-flex items-center gap-3 rounded-full bg-emerald-700 px-7 py-4 text-sm font-black text-white shadow-[0_18px_40px_rgba(0,140,69,0.24)] transition hover:bg-emerald-800">
            Ir al cotizador <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pasos.map((paso, index) => (
            <article key={paso.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white">{paso.icon}</div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Paso {index + 1}</span>
              </div>
              <h2 className="mt-4 text-lg font-black">{paso.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{paso.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <InfoCard icon={<Ruler className="h-6 w-6" />} title="Chapas para techo">
            Chapas sinusoidales y trapezoidales para cubiertas, techos, cerramientos, tinglados y galpones. Se pueden cotizar galvanizadas, cincalum y prepintadas, definiendo perfil, material, calibre, largo y cantidad.
          </InfoCard>
          <InfoCard icon={<Truck className="h-6 w-6" />} title="Bobinas de acero">
            Bobinas vendidas por metro para zinguería, fabricación, perfiles y piezas a medida. El cotizador permite elegir calibre, ancho, tipo, metros por bobina y cantidad de bobinas.
          </InfoCard>
          <InfoCard icon={<ShieldCheck className="h-6 w-6" />} title="Chapas estándar">
            Chapas de medidas fijas para usos estructurales, comerciales y de obra: negras estampadas, lisas negras LAF/LAC, galvanizadas y prepintadas. El sistema muestra precio por unidad y total según cantidad.
          </InfoCard>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">Más materiales disponibles</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">También trabajamos otros insumos para obra y construcción</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Además del cotizador online de chapas y bobinas, Giacosa Elio comercializa materiales complementarios para techos, estructuras, cerramientos y trabajos de construcción. Si no encontrás un producto en el cotizador, podés consultar por WhatsApp o pedir asesoramiento comercial.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Tubos estructurales", "También conocidos como caños estructurales. Se usan en estructuras metálicas, portones, cerramientos, tinglados, soportes y trabajos de herrería."],
                
                ["Tornillos", "Insumos de fijación para armado, sujeción y trabajos generales de obra. Recomendados según material, soporte y tipo de instalación."],
                ["Autoperforantes", "Usados especialmente para fijar chapas, perfiles y elementos metálicos. Ayudan a una instalación más rápida y práctica."],
                ["Aislantes", "Materiales para mejorar confort térmico, reducir condensación y acompañar instalaciones de techos y cerramientos."],
                ["Otros materiales", "También podés consultar por accesorios, insumos de obra y materiales complementarios para construcción en Tucumán."],
              ].map(([title, text]) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                  <h3 className="text-base font-black text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Datos que importan antes de confirmar</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Las condiciones de pago cambian el total final. Por eso el carrito solicita forma de pago, nombre y teléfono antes de generar la cotización.
              </p>
            </div>
            <div className="space-y-3">
              {[
                ["¿El descuento en efectivo se calcula automáticamente?", "Sí. Si corresponde, el sistema actualiza el total según la condición de pago elegida."],
                ["¿Las cuotas modifican el total?", "Sí. Según tarjeta y cantidad de cuotas puede existir descuento, precio igual o recargo."],
                ["¿La cotización reserva stock?", "No. La cotización queda sujeta a disponibilidad de stock y confirmación del vendedor."],
                ["¿Puedo sumar varios productos?", "Sí. Podés agregar chapas para techo, bobinas y chapas estándar al mismo carrito."],
              ].map(([q, a]) => (
                <details key={q} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 open:border-emerald-200 open:bg-emerald-50/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-slate-900">
                    <span>{q}</span>
                    <HelpCircle className="h-4 w-4 shrink-0 text-emerald-700" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">Cotización online</p>
              <h2 className="mt-2 text-3xl font-black">Cotizá con datos claros y atención local</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Giacosa Elio atiende consultas de materiales para construcción en Tucumán, con foco en chapas para techo, bobinas, chapas estándar, tubos estructurales, caños estructurales, tornillos, autoperforantes, aislantes y materiales complementarios para obra.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => goToCotizador(navigateToHomeSection)} className="inline-flex items-center gap-3 rounded-full bg-emerald-600 px-6 py-4 text-sm font-black text-white transition hover:bg-emerald-700">
                Cotizar ahora <ArrowRight className="h-5 w-5" />
              </button>
              <a href="https://wa.me/5493815589875" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15">
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Corralón en Tucumán", "Chapas para techo", "Bobinas de acero", "Chapas estándar", "Tubos estructurales", "Caños estructurales", "Tornillos autoperforantes", "Aislantes para techos"].map((term) => (
            <div key={term} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-700">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" /> {term}
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
