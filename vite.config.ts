import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
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