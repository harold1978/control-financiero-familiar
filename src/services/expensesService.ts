/** Operaciones sobre los gastos registrados. */
import { MAX_LENGTH } from '../constants/app';
import type { Expense, Fortnight } from '../types';
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
import { toExpense } from './mappers';

/** Datos que envía el formulario de gastos (el monto llega como texto). */
export interface ExpenseDraft {
  date: string;
  description: string;
  categoryId: string;
  incomeId: string | null;
  amount: string;
  fortnight: Fortnight;
  notes: string;
}

/** Suscripción en tiempo real a los gastos (ordenados por fecha). */
export function subscribeExpenses(handlers: DataHandlers<Expense>): () => void {
  return subscribeCollection(
    'expenses',
    toExpense,
    {
      onData: (items) => handlers.onData(sortDocuments(items)),
      onError: handlers.onError,
    },
  );
}

/** Valida un formulario de gasto y devuelve sus valores normalizados. */
function validateDraft(draft: ExpenseDraft) {
  const date = validateDate(draft.date);
  if (!date.ok) throw new Error(date.error);

  const description = validateRequiredText(draft.description, 'descripción', MAX_LENGTH.description);
  if (!description.ok) throw new Error(description.error);

  if (!draft.categoryId) throw new Error('Selecciona una categoría de gasto.');

  const amount = validateAmount(draft.amount, 'monto');
  if (!amount.ok) throw new Error(amount.error);

  const notes = validateOptionalText(draft.notes, 'notas', MAX_LENGTH.notes, true);
  if (!notes.ok) throw new Error(notes.error);

  return { date: date.value, description: description.value, amount: amount.value, notes: notes.value };
}

/** Crea un gasto con el siguiente código disponible (G-001, G-002…). */
export async function createExpense(draft: ExpenseDraft, existing: Expense[]): Promise<string> {
  const values = validateDraft(draft);
  const code = buildNextCode(existing.map((expense) => expense.code), 'G');
  const timestamp = nowIso();

  return addDocument('expenses', {
    code,
    date: values.date,
    description: values.description,
    categoryId: draft.categoryId,
    incomeId: draft.incomeId,
    amount: values.amount,
    fortnight: draft.fortnight,
    notes: values.notes,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

/** Actualiza un gasto existente (el código no cambia). */
export async function updateExpense(expense: Expense, draft: ExpenseDraft): Promise<void> {
  const values = validateDraft(draft);

  await updateDocument('expenses', expense.id, {
    date: values.date,
    description: values.description,
    categoryId: draft.categoryId,
    incomeId: draft.incomeId,
    amount: values.amount,
    fortnight: draft.fortnight,
    notes: values.notes,
    updatedAt: nowIso(),
  });
}

/** Elimina un gasto. */
export async function removeExpense(expenseId: string): Promise<void> {
  await deleteDocument('expenses', expenseId);
}
