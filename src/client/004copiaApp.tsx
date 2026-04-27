import { useState, useEffect, useRef, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ShoppingCart, Menu, X } from "lucide-react";
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

// Creamos un tipo para la función de navegación a sección de Home
export type NavigateToHomeSection = (sectionId: string) => void;

export default function App() {
  const isAdmin = window.location.hash === "#admin-precios";
  const [view, setView] = useState<View>(isAdmin ? "admin" : "home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [precios, setPrecios] = useState<Precios | null>(null);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [errorPrecios, setErrorPrecios] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs para manejar la navegación programática a secciones de Home
  const pendingSectionScroll = useRef<string | null>(null);

  useEffect(() => {
    fetch("/api/precios")
      .then(async (r) => {
        if (!r.ok) {
          throw new Error("No se pudieron cargar los precios");
        }
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
    setCart((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      return { ...item, cantidad, subtotalARS: item.precioUnitarioARS * cantidad };
    }));
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
    setView("home");
  }

  // Nueva función: navegar a Home y luego scrollear suave a un ID (bloque)
  const navigateToHomeSection = useCallback((sectionId: string) => {
    // Si ya estamos en Home, esperamos a próximo tick y scrolleamos
    if (view === "home") {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } else {
      // Si no, guardamos el ID y cambiamos la vista. Cuando Home se renderice abajo, se scrolleará.
      pendingSectionScroll.current = sectionId;
      setView("home");
    }
  }, [view]);

  // Efecto: si acabamos de ir a Home y hay scroll pendiente, ejecutamos scroll y reseteamos el ref
  useEffect(() => {
    if (view === "home" && pendingSectionScroll.current) {
      // Pequeño delay para asegurar render del DOM
      const sectionId = pendingSectionScroll.current;
      pendingSectionScroll.current = null;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [view]);

  const navItems: { key: View; label: string }[] = [
    { key: "home", label: "Cotizador" },
    { key: "historia", label: "Nuestra Historia" },
    { key: "informacion", label: "Información" },
    { key: "contacto", label: "Contactanos" },
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
      {/* Italian tricolor top bar */}
      <div className="h-1 w-full tricolor-bar" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => setView("home")} className="flex-shrink-0 flex items-center gap-2.5">
            <img src={logoGiacosa} alt="Giacosa Elio" className="h-10 w-auto" />
            <span className="hidden sm:block font-bold text-gray-900 text-sm tracking-tight">Giacosa Elio</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === item.key
                    ? "bg-[#008C45] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Cart + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("carrito")}
              className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all font-semibold text-sm ${
                view === "carrito"
                  ? "border-[#008C45] bg-[#008C45] text-white"
                  : "border-[#008C45] text-[#008C45] hover:bg-[#008C45] hover:text-white"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cotización</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#CD212A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setView(item.key); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  view === item.key ? "bg-[#008C45] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        {view === "home" && <Home precios={precios} onSelect={(type) => setView(type)} />}
        {view === "chapa_perfilada" && (
          <ChapaPerfiladaConfig precios={precios} onBack={() => setView("home")} onAdd={addToCart} />
        )}
        {view === "bobina" && (
          <BobinaConfig precios={precios} onBack={() => setView("home")} onAdd={addToCart} />
        )}
        {view === "chapa_estandar" && (
          <ChapaEstandarConfig precios={precios} onBack={() => setView("home")} onAdd={addToCart} />
        )}
        {view === "carrito" && (
          <Carrito
            cart={cart}
            precios={precios}
            onUpdateCantidad={updateCantidad}
            onRemove={removeFromCart}
            onAgregarMas={() => setView("home")}
            onClearCart={clearCart}
          />
        )}
        {view === "historia" && <Historia />}
        {/* Pasar la función navigateToHomeSection como prop a Informacion y a cualquier otro componente que lo requiera */}
        {view === "informacion" && <Informacion onCotizar={() => setView("home")} navigateToHomeSection={navigateToHomeSection} />}
        {view === "contacto" && <Contacto />}
        {view === "admin" && <AdminPrecios />}
      </main>

      {/* Footer */}
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
