/** Utilidades de fecha. Todas las fechas se guardan como texto ISO: YYYY-MM-DD. */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Devuelve la fecha local de hoy en formato YYYY-MM-DD. */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Valida un texto con formato YYYY-MM-DD y que sea una fecha real del calendario. */
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Formatea una fecha ISO para mostrarla al usuario.
 * Se construye la fecha con el constructor local para evitar el desfase
 * de un día que produce "new Date('2026-10-15')" (medianoche UTC).
 */
export function formatShortDate(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return isoDate;

  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  try {
    return new Intl.DateTimeFormat(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
}

/** Marca de tiempo completa para campos createdAt/updatedAt. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Nombre de archivo seguro con la fecha y hora actuales. */
export function buildFileTimestamp(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}
