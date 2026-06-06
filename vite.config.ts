import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mirrors express.static({ extensions: ['html'] }) for local dev.
// Maps extensionless paths to their .html counterpart in public/.
const staticHtmlRoutes: Record<string, string> = {
  "/chapas-tucuman": path.join(__dirname, "public/chapas-tucuman.html"),
};

const serveStaticHtml = {
  name: "serve-static-html",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      const filePath = staticHtmlRoutes[req.url?.split("?")[0] ?? ""];
      if (filePath && fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fs.readFileSync(filePath));
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), serveStaticHtml],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/client"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: __dirname,
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }
          if (id.includes("node_modules/framer-motion/")) {
            return "vendor-motion";
          }
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }
        },
      },
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    host: "0.0.0.0",
    watch: {
      ignored: ["**/data/**", "**/data/counter.json"],
    },
    proxy: {
      "/api": {
        target: `http://localhost:${Number(process.env.API_PORT) || 3000}`,
        changeOrigin: true,
      },
    },
  },
});