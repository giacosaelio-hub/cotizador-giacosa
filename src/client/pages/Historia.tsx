import logoGiacosa from "/logo-giacosa.png";

export default function Historia() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg" style={{ background: "linear-gradient(135deg, #008C45 0%, #005a2b 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
        <div className="relative p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center bg-white rounded-2xl shadow-lg p-3 mb-6">
            <img
              src={logoGiacosa}
              alt="Giacosa Elio"
              className="h-20"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Nuestra Historia</h1>
          <div className="w-16 h-1 mx-auto mb-4" style={{ background: "#CD212A" }} />
          <p className="text-green-100 text-base sm:text-lg max-w-xl mx-auto">
            65 años construyendo confianza en Tucumán
          </p>
        </div>
      </div>
      {/* Tricolor divider */}
      <div className="flex h-1 rounded-full overflow-hidden mb-10">
        <div className="flex-1" style={{ background: "#008C45" }} />
        <div className="flex-1 bg-gray-200" />
        <div className="flex-1" style={{ background: "#CD212A" }} />
      </div>
      {/* Story sections */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: "#008C45" }}>
              65
            </div>
            <h2 className="text-xl font-bold text-gray-900">Más de 65 años de trayectoria</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            <strong>Giacosa Elio – Corralón y Materiales para la Construcción</strong> es uno de los corralones con mayor historia de San Miguel de Tucumán. Con más de 65 años en el rubro, somos referente en la venta de materiales para la construcción en toda la región, atendiendo desde la primera piedra hasta el último detalle de cada obra.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: "#CD212A" }}>
              🏗️
            </div>
            <h2 className="text-xl font-bold text-gray-900">Para todo tipo de proyectos</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Atendemos <strong>obras, profesionales y particulares</strong>, ofreciendo soluciones integrales para todo tipo de proyectos de construcción. Nos especializamos en chapas para techo, perfiles metálicos y bobinas de acero, trabajando directamente con proveedores líderes del mercado para garantizar calidad y precio competitivo.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: "#008C45" }}>
              📍
            </div>
            <h2 className="text-xl font-bold text-gray-900">Dónde encontrarnos</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-3">
            Nuestra sucursal se encuentra en <strong>Batalla de Suipacha 482, San Miguel de Tucumán</strong>. Pasá a visitarnos, nuestro equipo de vendedores está listo para asesorarte en persona.
          </p>
          <a
            href="https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#008C45" }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Ver en Google Maps
          </a>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { value: "+65", label: "Años de trayectoria", color: "#008C45" },
          { value: "+20K", label: "Clientes satisfechos", color: "#CD212A" },
          { value: "100%", label: "Compromiso con vos", color: "#008C45" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 text-center">
            <p className="text-3xl sm:text-4xl font-bold mb-1 text-[#008c45] border-t-[#008c45] border-r-[#008c45] border-b-[#008c45] border-l-[#008c45]" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>
      {/* Contact CTA */}
      <div className="mt-8 rounded-2xl p-6 sm:p-8 text-center border-2" style={{ borderColor: "#008C45", background: "linear-gradient(135deg, #f0faf4 0%, #fff 100%)" }}>
        <p className="text-lg font-bold text-gray-900 mb-1">¿Necesitás asesoramiento?</p>
        <p className="text-gray-500 text-sm mb-5">Contactanos directamente y te ayudamos con tu proyecto</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/5493815589875"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.557 4.117 1.535 5.845L.057 23.716a.5.5 0 00.614.612l5.998-1.557A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.921 0-3.72-.5-5.282-1.376l-.378-.216-3.924 1.018 1.057-3.794-.237-.394A9.947 9.947 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            381-558-9875
          </a>
          <a
            href="https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-gray-50"
            style={{ borderColor: "#008C45", color: "#008C45" }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Cómo llegar
          </a>
        </div>
      </div>
    </div>
  );
}
