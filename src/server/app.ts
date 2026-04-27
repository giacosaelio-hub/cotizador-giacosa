import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import router from "./routes/index";

const app: Express = express();

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

if (isProd) {
  const publicDir = path.resolve(process.cwd(), "dist/public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

export default app;
