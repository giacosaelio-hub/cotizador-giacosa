/**
 * Validación y normalización de teléfonos argentinos.
 *
 * Un número nacional argentino tiene SIEMPRE 10 dígitos: característica
 * (2 a 4 dígitos, ej. 11 o 381) + abonado. La gente lo escribe de muchas
 * formas: "381 555-1234", "0381 15 555 1234", "+54 9 381 555 1234"...
 * Esta función las reduce a los 10 dígitos nacionales.
 *
 * Mantener sincronizado con src/server/lib/telefono.ts.
 */

export interface TelefonoResultado {
  valido: boolean;
  /** 10 dígitos nacionales (ej. "3815551234") o "" si no es válido. */
  nacional: string;
  /** Formato internacional para WhatsApp (ej. "5493815551234") o "". */
  whatsapp: string;
  /** Motivo del rechazo, listo para mostrar al usuario. */
  error: string;
}

const ERR_VACIO = "Ingresá un teléfono de contacto.";
const ERR_FORMATO =
  "Revisá el teléfono: incluí la característica, sin 0 ni 15 (ej: 381 555 1234).";

export function analizarTelefono(raw: string): TelefonoResultado {
  const texto = (raw ?? "").trim();
  const invalido = (error: string): TelefonoResultado => ({
    valido: false,
    nacional: "",
    whatsapp: "",
    error,
  });

  if (texto === "") return invalido(ERR_VACIO);

  // Solo se permiten dígitos y los separadores habituales.
  if (!/^[+\d\s().-]+$/.test(texto)) return invalido(ERR_FORMATO);

  let d = texto.replace(/\D/g, "");

  // Prefijo internacional: 54 (+ 9 para celulares). "0054" también.
  if (d.startsWith("0054")) d = d.slice(4);
  else if (texto.startsWith("+") || d.length > 11) {
    if (d.startsWith("54")) d = d.slice(2);
  }
  if (d.startsWith("9") && d.length === 11) d = d.slice(1);

  // Prefijo de discado nacional "0" (ej. 0381...).
  if (d.startsWith("0")) d = d.slice(1);

  // "15" de celular escrito después de la característica: 381 15 555 1234.
  if (d.length === 12) {
    for (const area of [2, 3, 4]) {
      if (d.slice(area, area + 2) === "15") {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }

  if (!/^[1-9]\d{9}$/.test(d)) return invalido(ERR_FORMATO);

  // Descarta números evidentemente falsos: 1111111111, 3810000000, etc.
  if (/^(\d)\1{9}$/.test(d)) return invalido(ERR_FORMATO);
  if (/(\d)\1{6,}/.test(d)) return invalido(ERR_FORMATO);
  if (d === "1234567890" || d === "0123456789") return invalido(ERR_FORMATO);

  return { valido: true, nacional: d, whatsapp: `549${d}`, error: "" };
}
