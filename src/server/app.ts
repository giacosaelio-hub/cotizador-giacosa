import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import router from "./routes/index";

const app: Express = express();

app.use(compression());

// Determina entorno
const isProd = process.env.NODE_ENV === "production";

// Para producción: permite un solo origin de frontend
// Para desarrollo: permite http://localhost:5173 y opcionalmente FRONTEND_ORIGIN extra
let allowedOrigins: string[] = [];

if (isProd) {
  if (process.env.FRONTEND_ORIGIN) {
    allowedOrigins = [process.env.FRONTEND_ORIGIN];
  }
} else {
  // Siempre permite localhost:5173 en desarrollo
  allowedOrigins = ["http://localhost:5173"];
  // Agrega FRONTEND_ORIGIN si existe y no es localhost:5173
  if (
    process.env.FRONTEND_ORIGIN &&
    process.env.FRONTEND_ORIGIN !== "http://localhost:5173"
  ) {
    allowedOrigins.push(process.env.FRONTEND_ORIGIN);
  }
}

// CORS configurado para permitir credenciales/cookies y varios origins válidos
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite llamados sin origin (ej: curl/postman)
      if (!origin) return callback(null, true);

      // Permite solo los origins explícitos
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Opcional: responde con error de CORS si origin no es aceptado
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api", router);

// Redirects SEO 301 → rutas canónicas del cotizador
const SEO_REDIRECTS: Record<string, string> = {
  "/chapa-sinusoidal-tucuman":    "/chapas-para-techo/sinusoidal",
  "/chapa-trapezoidal-tucuman":   "/chapas-para-techo/trapezoidal",
  "/chapa-acanalada-tucuman":     "/chapas-para-techo/sinusoidal",
  "/chapas-galvanizadas-tucuman": "/chapas-tucuman",
  "/chapas-lisas-tucuman":        "/chapas-estandar/negra",
  "/chapas-negras-tucuman":       "/chapas-estandar/negra",
  "/chapas-prepintadas-tucuman":  "/chapas-estandar/prepintada",
  "/chapa-cincalum-tucuman":      "/chapas-para-techo",
  "/bobinas-tucuman":             "/bobinas",
};
Object.entries(SEO_REDIRECTS).forEach(([from, to]) => {
  app.get(from, (_req, res) => res.redirect(301, to));
});

// Rutas SPA válidas — todo lo que no esté acá devuelve 404 real.
// Mantener sincronizado con VIEW_PATHS en App.tsx.
const SPA_ROUTES = new Set([
  "/",
  "/chapas-para-techo",
  "/chapas-para-techo/sinusoidal",
  "/chapas-para-techo/trapezoidal",
  "/chapas-estandar",
  "/chapas-estandar/galvanizada",
  "/chapas-estandar/prepintada",
  "/chapas-estandar/negra",
  "/chapas-estandar/estampada",
  "/bobinas",
  "/perfil-c",
  "/complementarios",
  "/carrito",
  "/nuestra-historia",
  "/informacion",
  "/contacto",
  "/admin",
]);

if (isProd) {
  const publicDir = path.resolve(process.cwd(), "dist/public");
  app.use(
    express.static(publicDir, {
      extensions: ["html"],
      index: false,
    })
  );
  app.get("*", (req, res) => {
    const ext = path.extname(req.path);

    // Archivos con extensión no-HTML → 404 directo
    if (ext && ext !== ".html") {
      res.status(404).send("Not found");
      return;
    }

    // Ruta SPA conocida → SPA con 200
    if (SPA_ROUTES.has(req.path)) {
      res.sendFile(path.join(publicDir, "index.html"));
      return;
    }

    // Ruta desconocida → 404 real (Google NO indexa, Search Console registra 404)
    // La SPA igual se carga y muestra la página 404 al usuario.
    res.status(404).sendFile(path.join(publicDir, "index.html"));
  });
}

export default app;
