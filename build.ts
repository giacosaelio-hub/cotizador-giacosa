import path from "path";
import { fileURLToPath } from "url";
import { build as esbuild } from "esbuild";
import { rm, mkdir } from "fs/promises";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildAll() {
  const distDir = path.resolve(__dirname, "dist");
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  console.log("Building server...");
  await esbuild({
    entryPoints: [path.resolve(__dirname, "src/server/index.ts")],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(distDir, "server.js"),
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: false,
    external: ["esbuild"],
    logLevel: "info",
  });

  console.log("Building client...");
  execSync("npx vite build", { stdio: "inherit", cwd: __dirname });

  console.log("\nBuild complete!");
  console.log("  Server → dist/server.js");
  console.log("  Client → dist/public/");
  console.log("\nTo start: node dist/server.js");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
