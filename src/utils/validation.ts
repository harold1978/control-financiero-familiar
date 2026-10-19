/**
 * Validación y limpieza de datos de entrada.
 *
 * Toda la información que entra a la aplicación se normaliza aquí:
 *  - se recortan espacios sobrantes,
 *  - se limita la longitud (minimización de datos),
 *  - los montos se convierten a número con reglas explícitas,
 *  - las fechas deben ser reales y estar en formato YYYY-MM-DD.
 */
import { MAX_LENGTH } from '../constants/app';
import { isValidIsoDate } from './dates';

/** Resultado de una validación: valor correcto o mensaje de error en español. */
export type FieldResult<T> = { ok: true; value: T } | { ok: false; error: string };

const ok = <T>(value: T): FieldResult<T> => ({ ok: true, value });
const fail = <T>(error: string): FieldResult<T> => ({ ok: false, error });

/** Elimina espacios repetidos y recorta el texto al largo máximo. */
export function cleanText(raw: string, maxLength: number = MAX_LENGTH.name): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/** Igual que cleanText pero conserva los saltos de línea (notas). */
export function cleanMultilineText(raw: string, maxLength: number = MAX_LENGTH.notes): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

/** Valida un texto corto obligatorio (nombre, categoría, descripción). */
export function validateRequiredText(
  raw: string,
  label: string,
  maxLength: number = MAX_LENGTH.description,
): FieldResult<string> {
  const value = cleanText(raw, maxLength);
  if (!value) return fail(`El campo "${label}" es obligatorio.`);
  return ok(value);
}

/** Valida un texto opcional (notas). Devuelve cadena vacía si no se escribió nada. */
export function validateOptionalText(
  raw: string,
  label: string,
  maxLength: number = MAX_LENGTH.notes,
  multiline = false,
): FieldResult<string> {
  const value = multiline ? cleanMultilineText(raw, maxLength) : cleanText(raw, maxLength);
  if (value.length > maxLength) {
    return fail(`El campo "${label}" supera los ${maxLength} caracteres.`);
  }
  return ok(value);
}

/**
 * Convierte un texto de monto a número.
 *
 * Reglas (aplican tanto "1234.56" como "1.234,56"):
 *  - Si hay dos separadores, el último que aparece es el decimal.
 *  - Una sola coma se trata como decimal ("1,5" = 1.5).
 *  - Un solo punto seguido de exactamente 3 dígitos se trata como miles ("1.234" = 1234).
 *  - Varios puntos o comas se eliminan como separadores de miles.
 */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,-]/g, '');
  if (!cleaned) return null;

  const negative = cleaned.trim().startsWith('-');
  const digits = cleaned.replace(/-/g, '');
  if (!digits) return null;

  let normalized = digits;
  const commas = (digits.match(/,/g) ?? []).length;
  const dots = (digits.match(/\./g) ?? []).length;

  if (commas > 0 && dots > 0) {
    const decimalIsComma = digits.lastIndexOf(',') > digits.lastIndexOf('.');
    const decimal = decimalIsComma ? ',' : '.';
    const thousands = decimalIsComma ? '.' : ',';
    normalized = digits.split(thousands).join('').replace(decimal, '.');
  } else if (commas > 0) {
    normalized = commas > 1 ? digits.replace(/,/g, '') : digits.replace(',', '.');
  } else if (dots > 0) {
    const digitsAfter = digits.length - digits.lastIndexOf('.') - 1;
    normalized = dots > 1 || digitsAfter === 3 ? digits.replace(/\./g, '') : digits;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return negative ? -parsed : parsed;
}

/** Valida un monto monetario positivo con máximo dos decimales. */
export function validateAmount(raw: string, label = 'Monto'): FieldResult<number> {
  const trimmed = raw.trim();
  if (!trimmed) return fail(`El campo "${label}" es obligatorio.`);

  const parsed = parseAmount(trimmed);
  if (parsed === null) return fail(`Escribe un valor numérico válido en "${label}".`);
  if (parsed <= 0) return fail(`El campo "${label}" debe ser mayor que cero.`);

  return ok(Math.round(parsed * 100) / 100);
}

/** Valida una fecha en formato YYYY-MM-DD. */
export function validateDate(raw: string, label = 'Fecha'): FieldResult<string> {
  const value = raw.trim();
  if (!value) return fail(`El campo "${label}" es obligatorio.`);
  if (!isValidIsoDate(value)) return fail(`Usa el formato AAAA-MM-DD en "${label}".`);
  return ok(value);
}

/**
 * Genera el siguiente código visible (I-001, G-001) a partir de los códigos
 * existentes. Se usa el número más alto para que no se repitan tras eliminar registros.
 */
export function buildNextCode(existingCodes: string[], prefix: 'I' | 'G'): string {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  let max = 0;

  for (const code of existingCodes) {
    const match = pattern.exec(code);
    if (match) max = Math.max(max, Number(match[1]));
  }

  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}
