/** Operaciones sobre el presupuesto por categoría. */
import type { Budget, Periodicity } from '../types';
import { nowIso } from '../utils/dates';
import { validateAmount } from '../utils/validation';
import { mergeDocument, subscribeCollection, type DataHandlers } from './repository';
import { toBudget } from './mappers';

/** Datos del formulario de presupuesto. */
export interface BudgetDraft {
  suggestedAmount: string;
  periodicity: Periodicity;
}

/** Suscripción en tiempo real a los presupuestos. */
export function subscribeBudgets(handlers: DataHandlers<Budget>): () => void {
  return subscribeCollection('budgets', toBudget, handlers);
}

/**
 * Guarda (crea o actualiza) el presupuesto de una categoría.
 * El documento usa el id de la categoría, por lo que solo puede existir uno por categoría.
 */
export async function saveBudget(categoryId: string, draft: BudgetDraft): Promise<void> {
  if (!categoryId) throw new Error('Falta la categoría del presupuesto.');

  const amount = validateAmount(draft.suggestedAmount, 'monto sugerido');
  if (!amount.ok) throw new Error(amount.error);

  await mergeDocument('budgets', categoryId, {
    categoryId,
    suggestedAmount: amount.value,
    periodicity: draft.periodicity,
    updatedAt: nowIso(),
  });
}
