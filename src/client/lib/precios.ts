export type CuotaOpcion = {
  key: string;
  label: string;
  porcentaje: number;
  activo: boolean;
};

export type TarjetaOpcion = {
  id: string;
  label: string;
  cuotas: CuotaOpcion[];
};

export type BobinaVariante = {
  id: string;
  calibre: number;
  ancho: number;
  tipo: "Galvanizada" | "Prepintada";
  color: string | null;
  precio: number;
};

export type Precios = {
  dolar: number;
  chapas_perfiladas: Record<string, number>;
  bobinas: Record<string, number>;
  bobinas_variantes?: BobinaVariante[];
  chapas_estandar: Record<string, Record<string, number>>;
  formas_pago?: TarjetaOpcion[];
};

export type CartItem = {
  id: string;
  tipo: "chapa_perfilada" | "bobina" | "chapa_estandar";
  descripcion: string;
  medida: string;
  cantidad: number;
  precioUnitarioUSD: number;
  precioUnitarioARS: number;
  subtotalARS: number;
};

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUSD(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const PIES_OPTIONS: number[] = [...Array.from({ length: 33 }, (_, i) => i + 10), 42.62];

export const PERFILES = [
  { key: "sinusoidal", label: "Chapa Sinusoidal", anchoUtil: 1.00 },
  { key: "trapezoidal", label: "Chapa Trapezoidal", anchoUtil: 1.10 },
];

export const MATERIALES = [
  { key: "galv", label: "Galvanizada" },
  { key: "cincalum", label: "Cincalum" },
  { key: "prepintada", label: "Prepintada" },
];

export const CALIBRES_CHAPA = ["24", "27"];

export const COLORES_PREPINTADA = ["Azul", "Gris", "Celeste", "Negra", "Roja", "Verde"];

export const CHAPAS_ESTANDAR_CATS = [
  { key: "estampada", label: "Chapa Negra Estampada" },
  { key: "lisa_negra", label: "Chapa Lisa Negra (LAF)" },
  { key: "lisa_galv", label: "Chapa Lisa Galvanizada" },
  { key: "lisa_prepintada", label: "Chapa Lisa Prepintada" },
];

export const MEDIDA_LABELS: Record<string, string> = {
  "1x2": "1.00 × 2.00 mts",
  "1.22x2.44": "1.22 × 2.44 mts",
};

export type EstandarVariante = { calibre: string; medidas: string[] };

export const ESTANDAR_VARIANTES: Record<string, EstandarVariante[]> = {
  estampada: [
    { calibre: "N18", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N20", medidas: ["1x2", "1.22x2.44"] },
  ],
  lisa_negra: [
    { calibre: "N14", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N16", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N18", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N20", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N22", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N24", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N27", medidas: ["1x2"] },
  ],
  lisa_galv: [
    { calibre: "N14", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N16", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N18", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N20", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N22", medidas: ["1x2", "1.22x2.44"] },
    { calibre: "N24", medidas: ["1.22x2.44"] },
    { calibre: "N27", medidas: ["1.22x2.44"] },
    { calibre: "N30", medidas: ["1x2"] },
  ],
  lisa_prepintada: [
    { calibre: "N25", medidas: ["1.22x2.44"] },
    { calibre: "N27", medidas: ["1.22x2.44"] },
  ],
};

export const CHAPA_LABELS: Record<string, string> = {
  sinusoidal_galv_24: "Chapa Sinusoidal Galvanizada Cal. 24",
  sinusoidal_galv_27: "Chapa Sinusoidal Galvanizada Cal. 27",
  sinusoidal_cincalum_24: "Chapa Sinusoidal Cincalum Cal. 24",
  sinusoidal_cincalum_27: "Chapa Sinusoidal Cincalum Cal. 27",
  sinusoidal_prepintada_24: "Chapa Sinusoidal Prepintada Cal. 24",
  trapezoidal_cincalum_24: "Chapa Trapezoidal Cincalum Cal. 24",
  trapezoidal_cincalum_27: "Chapa Trapezoidal Cincalum Cal. 27",
  trapezoidal_prepintada_24: "Chapa Trapezoidal Prepintada Cal. 24",
};

export function buildPrecioKey(perfil: string, material: string, calibre: string): string {
  return `${perfil}_${material}_${calibre}`;
}

export function buildEstandarKey(calibre: string, medida: string): string {
  return `${calibre}_${medida}`;
}

const IVA = 1.21;

export function calcChapaPrecio(precios: Precios, perfil: string, material: string, calibre: string, pies: number, cantidad: number) {
  const key = buildPrecioKey(perfil, material, calibre);
  const precioBase = precios.chapas_perfiladas[key] ?? 0;
  const precioPorPie = precioBase / 42.65;
  const precioUnitarioUSD = pies * precioPorPie;
  const precioTotalUSD = precioUnitarioUSD * cantidad;
  const precioUnitarioARS = precioUnitarioUSD * precios.dolar * IVA;
  const subtotalARS = precioTotalUSD * precios.dolar * IVA;
  return { precioUnitarioUSD, precioUnitarioARS, subtotalARS };
}

export function findBobinaVariante(precios: Precios, calibre: number, ancho: number, colorOTipo: string): BobinaVariante | null {
  const variantes = precios.bobinas_variantes ?? [];
  if (!colorOTipo || colorOTipo === "Galvanizada") {
    return variantes.find(v => v.calibre === calibre && v.ancho === ancho && v.tipo === "Galvanizada") ?? null;
  }
  return variantes.find(v => v.calibre === calibre && v.ancho === ancho && v.tipo === "Prepintada" && v.color === colorOTipo) ?? null;
}

export function calcBobinaPrecio(precios: Precios, calibre: string, ancho: number, colorOTipo: string, metros: number) {
  let precioPorMetroUSD: number;
  if (precios.bobinas_variantes && precios.bobinas_variantes.length > 0) {
    const variante = findBobinaVariante(precios, parseInt(calibre, 10), ancho, colorOTipo);
    precioPorMetroUSD = variante?.precio ?? 0;
  } else {
    precioPorMetroUSD = precios.bobinas[calibre] ?? 0;
  }
  const precioUnitarioARS = precioPorMetroUSD * precios.dolar * IVA;
  const subtotalARS = precioUnitarioARS * metros;
  return { precioUnitarioUSD: precioPorMetroUSD, precioUnitarioARS, subtotalARS };
}

export function calcEstandarPrecio(precios: Precios, categoria: string, key: string, cantidad: number) {
  const precioUSD = precios.chapas_estandar?.[categoria]?.[key] ?? 0;
  const precioUnitarioARS = precioUSD * precios.dolar * IVA;
  const subtotalARS = precioUnitarioARS * cantidad;
  return { precioUnitarioUSD: precioUSD, precioUnitarioARS, subtotalARS };
}

export function generateCotizacionNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const stored = localStorage.getItem("cot_counter_date");
  const today = `${yy}${mm}${dd}`;
  let counter = 1;
  if (stored === today) {
    counter = parseInt(localStorage.getItem("cot_counter") ?? "0", 10) + 1;
  }
  localStorage.setItem("cot_counter_date", today);
  localStorage.setItem("cot_counter", String(counter));
  return `COT-${today}-${String(counter).padStart(3, "0")}`;
}

export function formatFecha(date: Date): string {
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
