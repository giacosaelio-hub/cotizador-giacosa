import { useState, useEffect, useRef, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import logoGiacosa from "/logo-giacosa.png";
import Home from "@/pages/Home";
import ChapaPerfiladaConfig from "@/pages/ChapaPerfiladaConfig";
import BobinaConfig from "@/pages/BobinaConfig";
import ChapaEstandarConfig from "@/pages/ChapaEstandarConfig";
import Carrito from "@/pages/Carrito";
import Historia from "@/pages/Historia";
import Informacion from "@/pages/Informacion";
import Contacto from "@/pages/Contacto";
import AdminPrecios from "@/pages/AdminPrecios";
import { CartItem, Precios } from "@/lib/precios";

type ProductType = "chapa_perfilada" | "bobina" | "chapa_estandar";
type View = "home" | ProductType | "carrito" | "historia" | "informacion" | "contacto" | "admin";

export type NavigateToHomeSection = (sectionId: string) => void;

export default function App() {
  const isAdmin = window.location.hash === "#admin-precios";
  const [view, setView] = useState<View>(isAdmin ? "admin" : "home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [precios, setPrecios] = useState<Precios | null>(null);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [errorPrecios, setErrorPrecios] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingSectionScroll = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/precios")
      .then(async (r) => {
        if (!r.ok) throw new Error("No se pudieron cargar los precios");
        return r.json();
      })
      .then((data) => {
        setPrecios(data);
        setLoadingPrecios(false);
      })
      .catch(() => {
        setErrorPrecios("No se pudieron cargar los precios. Recargá la página.");
        setLoadingPrecios(false);
      });
  }, []);

  function addToCart(item: Omit<CartItem, "id">) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setCart((prev) => [...prev, { ...item, id }]);
    setView("carrito");
  }

  function updateCantidad(id: string, cantidad: number) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, cantidad, subtotalARS: item.precioUnitarioARS * cantidad };
      }),
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    console.trace("[APP] clearCart ejecutado -> manda a home");
    setCart([]);
    setView("home");
  }

  const navigateToHomeSection = useCallback((sectionId: string) => {
    console.trace("[APP] navigateToHomeSection ejecutado ->", sectionId);
    setMobileMenuOpen(false);
    if (view === "home") {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } else {
      pendingSectionScroll.current = sectionId;
      setView("home");
    }
  }, [view]);

  useEffect(() => {
    if (view === "home" && pendingSectionScroll.current) {
      const sectionId = pendingSectionScroll.current;
      pendingSectionScroll.current = null;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [view]);

  function goHomeTop() {
    console.trace("[APP] goHomeTop ejecutado -> manda a home arriba");
    setMobileMenuOpen(false);
    setView("home");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function goToView(nextView: View) {
    console.trace("[APP] goToView ejecutado ->", nextView);
    setMobileMenuOpen(false);
    setView(nextView);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
  }

  function goToCotizador() {
    navigateToHomeSection("cotizador-categorias");
  }

  const navItems: { key: View; label: string; action: () => void }[] = [
    { key: "home", label: "Cotizador", action: goToCotizador },
    { key: "historia", label: "Nuestra historia", action: () => goToView("historia") },
    { key: "informacion", label: "Información", action: () => goToView("informacion") },
    { key: "contacto", label: "Contactanos", action: () => goToView("contacto") },
  ];

  if (loadingPrecios) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0faf4 0%, #fff 50%, #fdf0f0 100%)" }}>
        <div className="text-center">
          <img src={logoGiacosa} alt="Giacosa" className="h-20 mx-auto mb-6 opacity-80" />
          <div className="w-8 h-8 border-4 border-[#008C45] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Cargando precios...</p>
        </div>
      </div>
    );
  }

  if (errorPrecios || !precios) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-4">
          <p className="text-[#CD212A] font-semibold mb-2">Error al cargar</p>
          <p className="text-gray-500 text-sm">{errorPrecios}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#008C45] text-white rounded-lg text-sm font-semibold">Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-1 w-full tricolor-bar" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101317]/95 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1450px] items-center justify-between gap-4 px-4 sm:px-8">
          <button
            type="button"
            onClick={goHomeTop}
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-white/[0.06]"
            aria-label="Ir al inicio"
          >
            <img src={logoGiacosa} alt="Giacosa Elio - Corralón y Materiales" className="h-11 w-11 rounded-xl object-contain bg-white shadow-sm ring-1 ring-white/20" />
            <span className="hidden min-w-0 sm:block">
              <span className="block text-sm font-black leading-tight tracking-tight text-white">Giacosa Elio</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">Corralón y materiales</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] p-1 md:flex">
            {navItems.map((item) => {
              const active = item.key === "home" ? view === "home" : view === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.action}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    active ? "bg-emerald-600 text-white shadow-sm" : "text-white/72 hover:bg-white/[0.08] hover:text-emerald-300"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToView("carrito")}
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black shadow-sm transition ${
                view === "carrito" ? "bg-emerald-700 text-white" : "border border-emerald-400/30 bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2.4} />
              <span className="hidden sm:inline">Cotización</span>
              {cart.length > 0 && (
                <span className="absolute -right-1.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-black text-white ring-2 ring-[#101317]">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white shadow-sm transition hover:border-emerald-300/40 hover:text-emerald-300 md:hidden"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#101317] px-4 py-3 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-[1450px] flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.action}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black transition ${
                    view === item.key ? "bg-emerald-600 text-white" : "bg-white/[0.06] text-white/80 hover:bg-emerald-500/15 hover:text-emerald-300"
                  }`}
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {view === "home" && (
          <Home
            precios={precios}
            onSelect={(type) => setView(type)}
            onOpenHistoria={() => setView("historia")}
            onOpenInformacion={() => setView("informacion")}
            onOpenContacto={() => setView("contacto")}
            navigateToHomeSection={navigateToHomeSection}
          />
        )}
        {view === "chapa_perfilada" && <ChapaPerfiladaConfig precios={precios} onBack={() => setView("home")} onAdd={addToCart} />}
        {view === "bobina" && <BobinaConfig precios={precios} onBack={() => setView("home")} onAdd={addToCart} />}
        {view === "chapa_estandar" && <ChapaEstandarConfig precios={precios} onBack={() => setView("home")} onAdd={addToCart} />}
        {view === "carrito" && (
          <Carrito
            cart={cart}
            precios={precios}
            onUpdateCantidad={updateCantidad}
            onRemove={removeFromCart}
            onAgregarMas={() => navigateToHomeSection("cotizador-categorias")}
            onClearCart={clearCart}
          />
        )}
        {view === "historia" && <Historia />}
        {view === "informacion" && <Informacion onCotizar={() => setView("home")} navigateToHomeSection={navigateToHomeSection} />}
        {view === "contacto" && <Contacto />}
        {view === "admin" && <AdminPrecios />}
      </main>

      <footer className="bg-gray-900 text-gray-400 text-sm mt-auto">
        <div className="h-1 w-full tricolor-bar" />
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-white font-semibold">GIACOSA ELIO</p>
            <p>Corralón y Materiales para la Construcción</p>
            <p className="text-gray-500 text-xs mt-0.5">📍 Batalla de Suipacha 482, San Miguel de Tucumán</p>
          </div>
          <div className="text-center sm:text-right">
            <p>WhatsApp: <span className="text-[#008C45] font-medium">381-558-9875</span></p>
            <a href="https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-[#008C45] transition-colors">Ver en Google Maps →</a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
