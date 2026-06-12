/**
 * Convierte PNGs del proyecto a WebP con resize por categoría.
 * Uso: npx tsx scripts/convert-to-webp.ts
 *
 * Estrategia de dimensiones:
 *  - hero        → 1440px ancho, q72
 *  - productos   → 800px ancho,  q78
 *  - configurador → 600px ancho, q78
 *  - pagos       → 200px ancho,  q82
 *  - logo        → 80px ancho,   q85  (retina: 34px display × 2× + margen)
 */

import sharp from "sharp";
import * as fs from "fs";
import * as path from "path";

interface ImageJob {
  input: string;
  output: string;
  width: number;
  quality: number;
}

const PUBLIC = path.join(process.cwd(), "public");

const jobs: ImageJob[] = [
  // ── Hero ─────────────────────────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "images/hero/hero-chapas.png"),
    output: path.join(PUBLIC, "images/hero/hero-chapas.webp"),
    width:  1440,
    quality: 72,
  },

  // ── Productos ─────────────────────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "images/productos/chapas-techo.png"),
    output: path.join(PUBLIC, "images/productos/chapas-techo.webp"),
    width:  800,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/productos/chapas-estandar.png"),
    output: path.join(PUBLIC, "images/productos/chapas-estandar.webp"),
    width:  800,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/productos/bobinas.png"),
    output: path.join(PUBLIC, "images/productos/bobinas.webp"),
    width:  800,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/productos/perfil-c-hero.png"),
    output: path.join(PUBLIC, "images/productos/perfil-c-hero.webp"),
    width:  800,
    quality: 78,
  },

  // ── Configurador / Perfiles ──────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "images/configurador/perfiles/sinusoidal.png"),
    output: path.join(PUBLIC, "images/configurador/perfiles/sinusoidal.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/perfiles/trapezoidal.png"),
    output: path.join(PUBLIC, "images/configurador/perfiles/trapezoidal.webp"),
    width:  600,
    quality: 78,
  },

  // ── Configurador / Materiales ────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "images/configurador/materiales/galvanizada.png"),
    output: path.join(PUBLIC, "images/configurador/materiales/galvanizada.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/materiales/cincalum.png"),
    output: path.join(PUBLIC, "images/configurador/materiales/cincalum.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/materiales/prepintada.png"),
    output: path.join(PUBLIC, "images/configurador/materiales/prepintada.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/materiales/sinusoidal-galvanizada.png"),
    output: path.join(PUBLIC, "images/configurador/materiales/sinusoidal-galvanizada.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/materiales/sinusoidal-cincalum.png"),
    output: path.join(PUBLIC, "images/configurador/materiales/sinusoidal-cincalum.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/materiales/sinusoidal-prepintada.png"),
    output: path.join(PUBLIC, "images/configurador/materiales/sinusoidal-prepintada.webp"),
    width:  600,
    quality: 78,
  },

  // ── Configurador / Estándar ──────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "images/configurador/estandar/negra-estampada.png"),
    output: path.join(PUBLIC, "images/configurador/estandar/negra-estampada.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/estandar/lisa-galvanizada.png"),
    output: path.join(PUBLIC, "images/configurador/estandar/lisa-galvanizada.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/estandar/lisa-prepintada.png"),
    output: path.join(PUBLIC, "images/configurador/estandar/lisa-prepintada.webp"),
    width:  600,
    quality: 78,
  },
  {
    input:  path.join(PUBLIC, "images/configurador/estandar/lisa-negra.png"),
    output: path.join(PUBLIC, "images/configurador/estandar/lisa-negra.webp"),
    width:  600,
    quality: 78,
  },

  // ── Pagos ────────────────────────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "images/pagos/efectivo.png"),
    output: path.join(PUBLIC, "images/pagos/efectivo.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/visa.png"),
    output: path.join(PUBLIC, "images/pagos/visa.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/mastercard.png"),
    output: path.join(PUBLIC, "images/pagos/mastercard.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/amex.png"),
    output: path.join(PUBLIC, "images/pagos/amex.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/cabal.png"),
    output: path.join(PUBLIC, "images/pagos/cabal.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/naranja.png"),
    output: path.join(PUBLIC, "images/pagos/naranja.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/titanio.png"),
    output: path.join(PUBLIC, "images/pagos/titanio.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/cencosud.png"),
    output: path.join(PUBLIC, "images/pagos/cencosud.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/sol.png"),
    output: path.join(PUBLIC, "images/pagos/sol.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/credicash.png"),
    output: path.join(PUBLIC, "images/pagos/credicash.webp"),
    width:  200,
    quality: 82,
  },
  {
    input:  path.join(PUBLIC, "images/pagos/sucredito.png"),
    output: path.join(PUBLIC, "images/pagos/sucredito.webp"),
    width:  200,
    quality: 82,
  },

  // ── Logo ─────────────────────────────────────────────────────────────
  {
    input:  path.join(PUBLIC, "logo-giacosa.png"),
    output: path.join(PUBLIC, "logo-giacosa.webp"),
    width:  80,
    quality: 85,
  },
];

async function convertOne(job: ImageJob): Promise<{ path: string; before: number; after: number }> {
  const before = fs.statSync(job.input).size;

  await sharp(job.input)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality, effort: 5 })
    .toFile(job.output);

  const after = fs.statSync(job.output).size;
  return { path: job.output, before, after };
}

async function main() {
  let totalBefore = 0;
  let totalAfter = 0;
  const results: Array<{ name: string; before: number; after: number; ratio: string }> = [];

  for (const job of jobs) {
    if (!fs.existsSync(job.input)) {
      console.warn(`SKIP (not found): ${job.input}`);
      continue;
    }

    if (fs.existsSync(job.output)) {
      console.log(`EXISTS: ${path.relative(process.cwd(), job.output)} — re-generating`);
    }

    try {
      const r = await convertOne(job);
      totalBefore += r.before;
      totalAfter += r.after;
      const ratio = ((1 - r.after / r.before) * 100).toFixed(0);
      const name = path.relative(PUBLIC, job.output);
      results.push({ name, before: r.before, after: r.after, ratio: `${ratio}%` });
      console.log(`OK  ${name.padEnd(60)} ${(r.before / 1024).toFixed(0).padStart(6)}KB → ${(r.after / 1024).toFixed(0).padStart(5)}KB  (-${ratio}%)`);
    } catch (err) {
      console.error(`ERR ${job.input}: ${err}`);
    }
  }

  console.log("\n" + "─".repeat(80));
  console.log(`TOTAL  ${(totalBefore / 1024 / 1024).toFixed(2)} MB  →  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`SAVED  ${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%`);
}

main().catch((e) => { console.error(e); process.exit(1); });
