/**
 * Exportación de datos en JSON y CSV.
 *
 * Responde al derecho de portabilidad del usuario (RGPD art. 20 / CCPA):
 * la persona puede descargar toda su información en un formato abierto.
 *
 * En web se genera un archivo de descarga con el navegador; en Android se abre
 * la hoja "Compartir" del sistema para guardar o enviar el archivo.
 */
import { Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { Budget, Category, Expense, ExportPayload, Income } from '../types';
import { buildFileTimestamp } from './dates';
import { buildCategoryNames } from './calculations';

/** Versión del esquema del archivo exportado. */
export const EXPORT_SCHEMA_VERSION = 1;

export type ExportKind = 'incomes' | 'expenses' | 'budgets' | 'categories';

export interface ExportData {
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
}

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Agrupa todas las colecciones en un único documento exportable. */
export function buildExportPayload(data: ExportData): ExportPayload {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    application: 'control-financiero-familiar',
    categories: data.categories,
    incomes: data.incomes,
    expenses: data.expenses,
    budgets: data.budgets,
  };
}

/** Convierte el payload completo a JSON legible. */
export function toJson(data: ExportData): string {
  return JSON.stringify(buildExportPayload(data), null, 2);
}

/** Escapa un valor según la norma RFC 4180 para CSV. */
function escapeCsv(value: string | number): string {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsvRows(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))];
  return lines.join('\r\n');
}

/** Construye el CSV del conjunto de datos elegido. */
export function buildCsv(kind: ExportKind, data: ExportData): string {
  const categoryNames = buildCategoryNames(data.categories);

  if (kind === 'categories') {
    return toCsvRows(
      ['Tipo', 'Categoría', 'Descripción'],
      data.categories.map((category) => [category.type, category.name, category.description]),
    );
  }

  if (kind === 'incomes') {
    return toCsvRows(
      ['ID', 'Fecha', 'Descripción', 'Categoría', 'Monto', 'Periodicidad', 'Notas'],
      data.incomes.map((income) => [
        income.code,
        income.date,
        income.description,
        categoryNames.get(income.categoryId) ?? '',
        income.amount,
        income.periodicity,
        income.notes,
      ]),
    );
  }

  if (kind === 'expenses') {
    const incomesById = new Map(data.incomes.map((income) => [income.id, income]));
    return toCsvRows(
      ['ID', 'Fecha', 'Descripción', 'Categoría', 'Ingreso asociado', 'Monto', 'Quincena', 'Notas'],
      data.expenses.map((expense) => [
        expense.code,
        expense.date,
        expense.description,
        categoryNames.get(expense.categoryId) ?? '',
        expense.incomeId ? (incomesById.get(expense.incomeId)?.description ?? '') : '',
        expense.amount,
        expense.fortnight,
        expense.notes,
      ]),
    );
  }

  return toCsvRows(
    ['Categoría', 'Monto sugerido', 'Periodicidad'],
    data.budgets.map((budget) => [
      categoryNames.get(budget.categoryId) ?? '',
      budget.suggestedAmount,
      budget.periodicity,
    ]),
  );
}

/** Nombre de archivo con marca de tiempo para no sobrescribir versiones. */
export function buildFileName(kind: ExportKind, extension: 'json' | 'csv'): string {
  return `control-financiero-${kind}-${buildFileTimestamp()}.${extension}`;
}

/**
 * Entrega el archivo al usuario:
 *  - web: descarga directa con el navegador,
 *  - Android: hoja de compartir del sistema.
 */
export async function deliverFile(
  fileName: string,
  content: string,
  mime: string,
): Promise<ActionResult> {
  if (Platform.OS === 'web') {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
      return { ok: false, message: 'La descarga no está disponible en este navegador.' };
    }

    const isCsv = mime.includes('csv');
    const bom = isCsv ? '\uFEFF' : ''; // BOM para que Excel abra bien los acentos.
    const blob = new Blob([bom + content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);

    try {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } finally {
      URL.revokeObjectURL(url);
    }

    return { ok: true, message: `Se descargó ${fileName}.` };
  }

  try {
    const result = await Share.share({ title: fileName, message: content });
    if (result.action === Share.dismissedAction) {
      return { ok: false, message: 'Se canceló el guardado de los datos.' };
    }
    return { ok: true, message: 'Datos listos para guardar o compartir.' };
  } catch {
    return { ok: false, message: 'No se pudieron compartir los datos.' };
  }
}

/** Copia texto al portapapeles (útil cuando la descarga está bloqueada). */
export async function copyText(text: string): Promise<ActionResult> {
  try {
    await Clipboard.setStringAsync(text);
    return { ok: true, message: 'Contenido copiado al portapapeles.' };
  } catch {
    return { ok: false, message: 'No se pudo copiar el contenido.' };
  }
}
