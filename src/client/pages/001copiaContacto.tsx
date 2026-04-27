const WA_NUMBER = "5493815589875";
const MAPS_LINK = "https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5";
const FB_LINK = "https://www.facebook.com/Giacosaelio";
const IG_LINK = "https://www.instagram.com/giacosamateriales";

const HORARIOS = [
  { dia: "Lunes a Viernes", hora: "8:00–13:00 y 14:00–17:00" },
  { dia: "Sábado", hora: "8:30–12:30" },
  { dia: "Domingo", hora: "Cerrado" },
];

export default function Contacto() {
  function openWA(msg: string) {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactanos</h1>
        <div className="flex h-1 rounded-full overflow-hidden max-w-xs mx-auto mb-4">
          <div className="flex-1" style={{ background: "#008C45" }} />
          <div className="flex-1 bg-gray-200" />
          <div className="flex-1" style={{ background: "#CD212A" }} />
        </div>
        <p className="text-gray-500 text-sm">Estamos para ayudarte en tu proyecto</p>
      </div>

      <div className="flex flex-col gap-4">

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#25D36618" }}>
              <svg viewBox="0 0 24 24" fill="#25D366" className="w-6 h-6">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.557 4.117 1.535 5.845L.057 23.716a.5.5 0 00.614.612l5.998-1.557A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.921 0-3.72-.5-5.282-1.376l-.378-.216-3.924 1.018 1.057-3.794-.237-.394A9.947 9.947 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-0.5">WhatsApp</h3>
              <p className="text-gray-500 text-sm mb-3">381-558-9875</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => openWA("Hola, necesito una cotización.")}
                  className="flex-1 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "#25D366" }}
                >
                  Pedir cotización
                </button>
                <button
                  onClick={() => openWA("Hola, quiero consultar un producto.")}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border-2 transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#25D366", color: "#25D366" }}
                >
                  Consulta general
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Seguinos en redes</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Facebook */}
            <a
              href={FB_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#1877F218" }}>
                <svg viewBox="0 0 24 24" fill="#1877F2" className="w-5 h-5">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Facebook</p>
                <p className="text-xs text-gray-400">Giacosa Elio</p>
              </div>
            </a>

            {/* Instagram */}
            <a
              href={IG_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #f9ce3418, #ee218818, #c1358518)" }}>
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="url(#ig-grad)">
                  <defs>
                    <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f9ce34"/>
                      <stop offset="50%" stopColor="#ee2188"/>
                      <stop offset="100%" stopColor="#c13584"/>
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 group-hover:text-pink-600">Instagram</p>
                <p className="text-xs text-gray-400">@giacosamateriales</p>
              </div>
            </a>
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#008C4518" }}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#008C45" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-0.5">Sucursal</h3>
              <p className="text-gray-700 text-sm font-medium mb-0.5">Batalla de Suipacha 482</p>
              <p className="text-gray-500 text-sm mb-3">San Miguel de Tucumán, Argentina</p>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#008C45" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Cómo llegar
              </a>
            </div>
          </div>
        </div>

        {/* Horario */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#f5f5f7" }}>
              <svg className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-3">Horario de atención</h3>
              <div className="text-sm space-y-1.5">
                {HORARIOS.map(({ dia, hora }) => (
                  <div key={dia} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{dia}</span>
                    <span className={`font-semibold ${hora === "Cerrado" ? "text-gray-400" : "text-gray-900"}`}>{hora}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
