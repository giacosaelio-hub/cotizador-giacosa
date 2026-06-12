import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
const logoGiacosa = "/logo-giacosa.webp";
import Home from "@/pages/Home";
import { CartItem, Precios, Preselection } from "@/lib/precios";
import { trackMapsClick, trackWhatsAppClick } from "@/lib/analytics";

const ChapaPerfiladaConfig   = lazy(() => import("@/pages/ChapaPerfiladaConfig"));
const BobinaConfig           = lazy(() => import("@/pages/BobinaConfig"));
const ChapaEstandarConfig    = lazy(() => import("@/pages/ChapaEstandarConfig"));
const PerfilCConfig          = lazy(() => import("@/pages/PerfilCConfig"));
const ComplementariosConfig  = lazy(() => import("@/pages/ComplementariosConfig"));
const Carrito                = lazy(() => import("@/pages/Carrito"));
const Historia               = lazy(() => import("@/pages/Historia"));
const Informacion            = lazy(() => import("@/pages/Informacion"));
const Contacto               = lazy(() => import("@/pages/Contacto"));
const AdminPrecios           = lazy(() => import("@/pages/AdminPrecios"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  );
}

type ProductType = "chapa_perfilada" | "bobina" | "chapa_estandar" | "perfil_c" | "complementario";
type View = "home" | ProductType | "carrito" | "historia" | "informacion" | "contacto" | "admin" | "not_found";

export type NavigateToHomeSection = (sectionId: string) => void;

const VIEW_PATHS: Record<View, string> = {
  home: "/",
  chapa_perfilada: "/chapas-para-techo",
  bobina: "/bobinas",
  chapa_estandar: "/chapas-estandar",
  perfil_c: "/perfil-c",
  complementario: "/complementarios",
  carrito: "/carrito",
  historia: "/nuestra-historia",
  informacion: "/informacion",
  contacto: "/contacto",
  admin: "/admin",
  not_found: "", // no tiene ruta canónica; nunca se navega hacia acá
};

const PERFIL_SLUGS: Record<string, string> = {
  sinusoidal: "sinusoidal",
  trapezoidal: "trapezoidal",
};

const ESTANDAR_SLUGS: Record<string, string> = {
  galvanizada: "lisa_galv",
  prepintada: "lisa_prepintada",
  negra: "lisa_negra",
  estampada: "estampada",
};

// Breadcrumbs por ruta principal (1 nivel bajo Inicio). Se inyecta como JSON-LD
// en <head> desde setMeta. La home y las subpáginas (más de un segmento) no
// llevan breadcrumb; /chapas-tucuman es HTML estático y ya tiene el suyo.
const SITE_URL = "https://giacosaelio.com.ar";
const BREADCRUMB_LABELS: Record<string, string> = {
  "chapas-para-techo": "Chapas para techo",
  "chapas-estandar": "Chapas estándar",
  "bobinas": "Bobinas",
  "perfil-c": "Perfil C",
  "complementarios": "Complementarios",
  "nuestra-historia": "Nuestra historia",
  "informacion": "Información",
  "contacto": "Contacto",
};

function setBreadcrumbJsonLd() {
  const segments = window.location.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const existing = document.getElementById("breadcrumb-jsonld");

  // Solo rutas principales conocidas (un único segmento de path).
  const label = segments.length === 1 ? BREADCRUMB_LABELS[segments[0]] : undefined;
  if (!label) {
    existing?.remove();
    return;
  }

  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: label, item: `${SITE_URL}/${segments[0]}` },
    ],
  };

  const script = existing ?? document.createElement("script");
  if (!existing) {
    script.id = "breadcrumb-jsonld";
    script.setAttribute("type", "application/ld+json");
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function resolveViewFromPath(): { view: View; preselection?: Preselection } {
  const path = window.location.pathname;
  const segments = path.replace(/^\//, "").split("/");

  if (segments[0] === "chapas-para-techo") {
    const perfil = PERFIL_SLUGS[segments[1]];
    return { view: "chapa_perfilada", preselection: perfil ? { perfil } : undefined };
  }
  if (segments[0] === "chapas-estandar") {
    const categoria = ESTANDAR_SLUGS[segments[1]];
    return { view: "chapa_estandar", preselection: categoria ? { categoria } : undefined };
  }
  if (segments[0] === "bobinas") return { view: "bobina" };
  if (segments[0] === "perfil-c") return { view: "perfil_c" };
  if (segments[0] === "complementarios") return { view: "complementario" };
  if (segments[0] === "carrito") return { view: "carrito" };
  if (segments[0] === "nuestra-historia") return { view: "historia" };
  if (segments[0] === "informacion") return { view: "informacion" };
  if (segments[0] === "contacto") return { view: "contacto" };
  if (segments[0] === "admin") return { view: "admin" };

  // Compatibilidad con hashes legacy (links externos anteriores)
  const hash = window.location.hash;
  if (hash === "#chapas-techo") return { view: "chapa_perfilada" };
  if (hash === "#chapas-estandar") return { view: "chapa_estandar" };
  if (hash === "#admin-precios") return { view: "admin" };

  // Raíz
  if (!segments[0] || segments[0] === "") return { view: "home" };

  // Ruta no reconocida → 404 en la SPA
  return { view: "not_found" };
}

export default function App() {
  const initial = resolveViewFromPath();
  const [view, setView] = useState<View>(initial.view);
  const [preselection, setPreselection] = useState<Preselection | null>(initial.preselection ?? null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [precios, setPrecios] = useState<Precios | null>(null);
  const [loadingPrecios, setLoadingPrecios] = useState(true);
  const [errorPrecios, setErrorPrecios] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingSectionScroll = useRef<string | null>(null);

  // Captura de gclid (Google Ads Click ID) para conversiones offline/enhanced.
  // Se guarda en localStorage porque el usuario puede entrar por /chapas-para-techo,
  // /bobinas, etc. (no solo "/"), y el carrito lo lee recién al enviar la cotización.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get("gclid");

    if (gclid) {
      localStorage.setItem("gclid", gclid);
      localStorage.setItem("gclid_timestamp", new Date().toISOString());
    }
  }, []);

  // Título dinámico y meta description por ruta/subpágina
  useEffect(() => {
    function setMeta(title: string, description: string) {
      document.title = title;
      const el = document.querySelector('meta[name="description"]');
      if (el) el.setAttribute("content", description);

      // Canonical dinámico: cada ruta declara su propia URL canónica.
      // Sin esto, el <link rel="canonical"> estático de index.html apunta
      // siempre a "/" y Google trata todas las rutas como copias de la home.
      const path = window.location.pathname;
      const canonicalPath = path === "/" ? "/" : path.replace(/\/+$/, "");
      const canonicalHref = `https://giacosaelio.com.ar${canonicalPath}`;
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalHref);

      // BreadcrumbList por ruta (JSON-LD en <head>).
      setBreadcrumbJsonLd();
    }

    const perfil = preselection?.perfil;
    const cat    = preselection?.categoria;

    // Subpáginas de chapa perfilada
    if (view === "chapa_perfilada" && perfil === "sinusoidal") {
      setMeta(
        "Chapa Acanalada (Sinusoidal) en Tucumán | Giacosa Elio",
        "Chapa acanalada (sinusoidal) galvanizada, cincalum y prepintada en Tucumán. Cortada a medida desde bobina, calibre 24 y 27. Cotizá online al instante. Giacosa Elio, Suipacha 482."
      );
      return;
    }
    if (view === "chapa_perfilada" && perfil === "trapezoidal") {
      setMeta(
        "Chapa Trapezoidal en Tucumán | Giacosa Elio",
        "Chapa trapezoidal galvanizada, cincalum y prepintada en Tucumán. Mayor superficie cubierta por chapa. Cortada a medida, calibre 24 y 27. Cotizá online. Giacosa Elio, Suipacha 482."
      );
      return;
    }

    // Subpáginas de chapa estándar
    if (view === "chapa_estandar" && cat === "lisa_negra") {
      setMeta(
        "Chapa Negra (LAF) en Tucumán | Giacosa Elio",
        "Chapa negra (LAF/LAC, también: hoja negra) sin tratamiento en medidas 1×2 m y 1.22×2.44 m. Para herrería, fabricación y estructuras en Tucumán. Cotizá por unidad online. Giacosa Elio, Suipacha 482."
      );
      return;
    }
    if (view === "chapa_estandar" && cat === "estampada") {
      setMeta(
        "Chapa Negra Estampada en Tucumán | Giacosa Elio",
        "Chapa negra estampada con relieve decorativo para portones y cerramientos en Tucumán. Medidas 1×2 m y 1.22×2.44 m. Cotizá por unidad online. Giacosa Elio, Suipacha 482."
      );
      return;
    }
    if (view === "chapa_estandar" && cat === "lisa_galv") {
      setMeta(
        "Chapa Lisa Galvanizada (Hoja Galvanizada) en Tucumán | Giacosa Elio",
        "Chapa lisa galvanizada (hoja galvanizada) con protección de zinc. Medidas 1×2 m y 1.22×2.44 m. Para exteriores en Tucumán. Cotizá por unidad online. Giacosa Elio, Suipacha 482."
      );
      return;
    }
    if (view === "chapa_estandar" && cat === "lisa_prepintada") {
      setMeta(
        "Chapa Lisa Prepintada en Tucumán | Giacosa Elio",
        "Chapa lisa prepintada con terminación de color aplicada en fábrica. Medidas 1×2 m y 1.22×2.44 m. Lista para instalar en Tucumán. Cotizá por unidad online. Giacosa Elio."
      );
      return;
    }

    // Páginas principales
    type TD = { title: string; description: string };
    const pages: Partial<Record<View, TD>> = {
      home:            { title: "Giacosa Elio | Cotizador online de materiales en Tucumán",                              description: "Cotizá online chapas para techo, bobinas de acero, chapas estándar, Perfil C y complementarios para obra en Tucumán. Giacosa Elio, Suipacha 482." },
      chapa_perfilada: { title: "Chapas para Techo en Tucumán: Acanalada y Trapezoidal | Giacosa Elio",                  description: "Chapa acanalada (sinusoidal) y trapezoidal en Tucumán: galvanizada, cincalum y prepintada. Cortadas a medida desde bobina. Cotizá online al instante. Giacosa Elio, Suipacha 482." },
      chapa_estandar:  { title: "Chapas Estándar en Tucumán: Hoja Galvanizada, Negra y Lisa | Giacosa Elio",             description: "Hoja galvanizada, chapa negra (LAF), chapa lisa prepintada, perforada y estampada en medidas fijas. Para herrería, portones y fabricación en Tucumán. Cotizá por unidad online." },
      bobina:          { title: "Bobinas de acero en Tucumán | Giacosa Elio",                                            description: "Bobinas de acero galvanizado, cincalum y prepintado en Tucumán. Cotizá online por kilo y ancho. Giacosa Elio, Suipacha 482." },
      perfil_c:        { title: "Perfil C en Tucumán | Cotizador online | Giacosa Elio",                                 description: "Perfil C de acero galvanizado en Tucumán. Cotizá online por longitud y calibre. Giacosa Elio, Suipacha 482." },
      complementario:  { title: "Complementarios para obra en Tucumán | Giacosa Elio",                                   description: "Cumbreras, autoperforantes, tornillos y estaño para obras en Tucumán. Cotizá online. Giacosa Elio, Suipacha 482." },
      informacion:     { title: "Información sobre materiales para obra | Giacosa Elio",                                 description: "Información técnica sobre chapas, bobinas, perfil C y complementarios para obra en Tucumán. Giacosa Elio." },
      historia:        { title: "Nuestra historia | Giacosa Elio Corralón en Tucumán",                                   description: "Conocé la historia de Giacosa Elio, corralón y materiales para la construcción en San Miguel de Tucumán." },
      contacto:        { title: "Contacto | Giacosa Elio Corralón en Tucumán",                                           description: "Contactá a Giacosa Elio en Suipacha 482, San Miguel de Tucumán. Horarios de atención y WhatsApp." },
      carrito:         { title: "Cotización | Giacosa Elio",                                                              description: "Revisá tu cotización de materiales en Giacosa Elio." },
      admin:           { title: "Admin | Giacosa Elio",                                                                   description: "Panel de administración de precios — Giacosa Elio." },
    };

    const page = pages[view];
    if (page) {
      setMeta(page.title, page.description);
    } else {
      setMeta(
        "Giacosa Elio | Materiales para la Construcción en Tucumán",
        "Giacosa Elio, corralón y materiales para la construcción en San Miguel de Tucumán."
      );
    }
  }, [view, preselection]);

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

  // Botón Atrás/Adelante del browser
  useEffect(() => {
    const onPop = () => {
      const { view: nextView, preselection: nextPre } = resolveViewFromPath();
      setView(nextView);
      setPreselection(nextPre ?? null);
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function addToCart(item: Omit<CartItem, "id">) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setCart((prev) => [...prev, { ...item, id }]);
    setView("carrito");
    setPreselection(null);
    window.history.pushState({ view: "carrito" }, "", VIEW_PATHS.carrito);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
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
    setCart([]);
    setView("home");
    setPreselection(null);
    window.history.pushState({ view: "home" }, "", "/");
  }

  const navigateToHomeSection = useCallback(
    (sectionId: string) => {
      setMobileMenuOpen(false);
      if (view === "home") {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      } else {
        pendingSectionScroll.current = sectionId;
        setView("home");
        setPreselection(null);
        window.history.pushState({ view: "home" }, "", "/");
      }
    },
    [view],
  );

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
    setMobileMenuOpen(false);
    setView("home");
    setPreselection(null);
    window.history.pushState({ view: "home" }, "", "/");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }

  function goToView(nextView: View, subpath?: string) {
    setMobileMenuOpen(false);
    setView(nextView);
    setPreselection(null);
    const url = subpath ?? VIEW_PATHS[nextView];
    window.history.pushState({ view: nextView }, "", url);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "auto" }), 0);
  }

  // Navega directo a una vista con subcategoría preseleccionada (desde cross-sell)
  function navigateDirect(nextView: "complementario" | "perfil_c", subcategoria?: string) {
    setMobileMenuOpen(false);
    setView(nextView);
    setPreselection(subcategoria ? { categoria: subcategoria } : null);
    window.history.pushState({ view: nextView }, "", VIEW_PATHS[nextView]);
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #f0faf4 0%, #fff 50%, #fdf0f0 100%)" }}
      >
        <div className="text-center">
          <img src={logoGiacosa} alt="Giacosa" className="h-20 mx-auto mb-6 opacity-80" />
          <div className="w-8 h-8 border-4 border-[#008C45] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#008C45] text-white rounded-lg text-sm font-semibold"
          >
            Reintentar
          </button>
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
            <img
              src={logoGiacosa}
              alt="Giacosa Elio - Corralón y Materiales"
              className="h-11 w-11 rounded-xl object-contain bg-white shadow-sm ring-1 ring-white/20"
            />
            <span className="hidden min-w-0 sm:block">
              <span className="block text-sm font-black leading-tight tracking-tight text-white">Giacosa Elio</span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                Corralón y materiales
              </span>
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
                    active
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-white/72 hover:bg-white/[0.08] hover:text-emerald-300"
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
              aria-label="Ver cotización"
              className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-black shadow-sm transition ${
                view === "carrito"
                  ? "bg-emerald-700 text-white"
                  : "border border-emerald-400/30 bg-emerald-500 text-white hover:bg-emerald-600"
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
                    view === item.key
                      ? "bg-emerald-700 text-white"
                      : "bg-white/[0.06] text-white/80 hover:bg-emerald-500/15 hover:text-emerald-300"
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
            onSelect={(type) => goToView(type)}
            onOpenHistoria={() => goToView("historia")}
            onOpenInformacion={() => goToView("informacion")}
            onOpenContacto={() => goToView("contacto")}
            navigateToHomeSection={navigateToHomeSection}
          />
        )}
        <Suspense fallback={<PageLoader />}>
          {view === "chapa_perfilada" && (
            <ChapaPerfiladaConfig
              precios={precios}
              preselection={preselection}
              onBack={() => goToView("home")}
              onAdd={addToCart}
            />
          )}
          {view === "bobina" && (
            <BobinaConfig precios={precios} onBack={() => goToView("home")} onAdd={addToCart} />
          )}
          {view === "chapa_estandar" && (
            <ChapaEstandarConfig
              precios={precios}
              preselection={preselection}
              onBack={() => goToView("home")}
              onAdd={addToCart}
            />
          )}
          {view === "perfil_c" && (
            <PerfilCConfig precios={precios} onBack={() => goToView("home")} onAdd={addToCart} />
          )}
          {view === "complementario" && (
            <ComplementariosConfig
              precios={precios}
              onBack={() => goToView("home")}
              onAdd={addToCart}
              initialSubcategoria={preselection?.categoria as "cumbreras" | "autoperforantes" | "tornillos" | "estaño" | undefined}
            />
          )}
          {view === "carrito" && (
            <Carrito
              cart={cart}
              precios={precios}
              onUpdateCantidad={updateCantidad}
              onRemove={removeFromCart}
              onAgregarMas={() => navigateToHomeSection("cotizador-categorias")}
              onClearCart={clearCart}
              onNavigateDirect={navigateDirect}
            />
          )}
          {view === "historia" && <Historia />}
          {view === "informacion" && (
            <Informacion
              onCotizar={() => goToView("home")}
              navigateToHomeSection={navigateToHomeSection}
            />
          )}
          {view === "contacto" && <Contacto />}
          {view === "admin" && <AdminPrecios />}
          {view === "not_found" && (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
              <p className="text-7xl font-black text-emerald-700">404</p>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">Página no encontrada</h1>
              <p className="mt-2 text-slate-500">La dirección que ingresaste no existe en este sitio.</p>
              <button
                type="button"
                onClick={() => goToView("home")}
                className="mt-6 rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-black text-white shadow hover:bg-emerald-800"
              >
                Ir al cotizador
              </button>
            </div>
          )}
        </Suspense>
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
            <p>
              WhatsApp:{" "}
              <a
                href="https://wa.me/5493815589875"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer_global")}
                className="text-[#008C45] font-medium hover:underline"
              >
                381-558-9875
              </a>
            </p>
            <a
              href="https://maps.app.goo.gl/Z7h2TYXir8mYTKBt5"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackMapsClick("footer_global")}
              className="text-xs text-gray-500 hover:text-[#008C45] transition-colors"
            >
              Ver en Google Maps →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
