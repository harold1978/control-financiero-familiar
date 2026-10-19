/** Operaciones sobre los ingresos registrados. */
import { MAX_LENGTH } from '../constants/app';
import type { Income, Periodicity } from '../types';
import { nowIso } from '../utils/dates';
import {
  buildNextCode,
  validateAmount,
  validateDate,
  validateOptionalText,
  validateRequiredText,
} from '../utils/validation';
import {
  addDocument,
  deleteDocument,
  sortDocuments,
  subscribeCollection,
  updateDocument,
  type DataHandlers,
} from './repository';
import { toIncome } from './mappers';

/** Datos que envía el formulario de ingresos (el monto llega como texto). */
export interface IncomeDraft {
  date: string;
  description: string;
  categoryId: string;
  amount: string;
  periodicity: Periodicity;
  notes: string;
}

/** Suscripción en tiempo real a los ingresos (ordenados por fecha). */
export function subscribeIncomes(handlers: DataHandlers<Income>): () => void {
  return subscribeCollection(
    'incomes',
    toIncome,
    {
      onData: (items) => handlers.onData(sortDocuments(items)),
      onError: handlers.onError,
    },
  );
}

/** Valida un formulario de ingreso y devuelve sus valores normalizados. */
function validateDraft(draft: IncomeDraft) {
  const date = validateDate(draft.date);
  if (!date.ok) throw new Error(date.error);

  const description = validateRequiredText(draft.description, 'descripción', MAX_LENGTH.description);
  if (!description.ok) throw new Error(description.error);

  if (!draft.categoryId) throw new Error('Selecciona una categoría de ingreso.');

  const amount = validateAmount(draft.amount, 'monto');
  if (!amount.ok) throw new Error(amount.error);

  const notes = validateOptionalText(draft.notes, 'notas', MAX_LENGTH.notes, true);
  if (!notes.ok) throw new Error(notes.error);

  return { date: date.value, description: description.value, amount: amount.value, notes: notes.value };
}

/** Crea un ingreso con el siguiente código disponible (I-001, I-002…). */
export async function createIncome(draft: IncomeDraft, existing: Income[]): Promise<string> {
  const values = validateDraft(draft);
  const code = buildNextCode(existing.map((income) => income.code), 'I');
  const timestamp = nowIso();

  return addDocument('incomes', {
    code,
    date: values.date,
    description: values.description,
    categoryId: draft.categoryId,
    amount: values.amount,
    periodicity: draft.periodicity,
    notes: values.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

/** Actualiza un ingreso existente (el código no cambia). */
export async function updateIncome(income: Income, draft: IncomeDraft): Promise<void> {
  const values = validateDraft(draft);

  await updateDocument('incomes', income.id, {
    date: values.date,
    description: values.description,
    categoryId: draft.categoryId,
    amount: values.amount,
    periodicity: draft.periodicity,
    notes: values.notes,
    updatedAt: nowIso(),
  });
}

/** Elimina un ingreso. */
export async function removeIncome(incomeId: string): Promise<void> {
  await deleteDocument('incomes', incomeId);
}
