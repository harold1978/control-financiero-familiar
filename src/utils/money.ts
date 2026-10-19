/**
 * Formateo de números, dinero y porcentajes.
 *
 * Se usa la API Intl del navegador/Hermes para que el formato respete
 * la configuración regional del dispositivo del usuario y la moneda elegida.
 * Si Intl no estuviera disponible, se recurre a un formato manual sencillo.
 */

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function fallbackNumber(value: number, fractionDigits: number): string {
  const fixed = Math.abs(value).toFixed(fractionDigits);
  const [integerPart, decimalPart] = fixed.split('.');
  const grouped = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = value < 0 ? '-' : '';
  return decimalPart ? `${sign}${grouped},${decimalPart}` : `${sign}${grouped}`;
}

/** Formata un monto con la moneda indicada (ej: ₡175 000,00). */
export function formatMoney(amount: number, currency: string): string {
  const value = Number.isFinite(amount) ? amount : 0;

  try {
    let formatter = currencyFormatters.get(currency);
    if (!formatter) {
      formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      currencyFormatters.set(currency, formatter);
    }
    return formatter.format(value);
  } catch {
    return `${currency} ${fallbackNumber(value, 2)}`;
  }
}

/** Formata un monto sin símbolo de moneda (para tablas compactas). */
export function formatAmount(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return fallbackNumber(value, 2);
  }
}

/** Formata una razón como porcentaje (0.79 -> "79%"). */
export function formatPercent(ratio: number, fractionDigits = 1): string {
  const value = Number.isFinite(ratio) ? ratio : 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return `${fallbackNumber(value * 100, fractionDigits)}%`;
  }
}

/** Formata un entero (conteos de registros). */
export function formatCount(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(safeValue);
  } catch {
    return String(Math.round(safeValue));
  }
}
