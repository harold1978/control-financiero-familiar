/** Operaciones sobre las categorías de ingresos y gastos. */
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  MAX_LENGTH,
} from '../constants/app';
import type { Category, TransactionType } from '../types';
import { cleanText, validateRequiredText } from '../utils/validation';
import { nowIso } from '../utils/dates';
import { addDocument, deleteDocument, subscribeCollection, updateDocument, type DataHandlers } from './repository';
import { toCategory } from './mappers';

export interface CategoryDraft {
  type: TransactionType;
  name: string;
  description: string;
}

/** Suscripción en tiempo real a las categorías. */
export function subscribeCategories(handlers: DataHandlers<Category>): () => void {
  return subscribeCollection('categories', toCategory, handlers);
}

/** Indica si otra categoría del mismo tipo ya usa ese nombre. */
export function isCategoryNameTaken(
  name: string,
  type: TransactionType,
  existing: Category[],
  ignoreId?: string,
): boolean {
  const normalized = name.toLocaleLowerCase('es');
  return existing.some(
    (category) =>
      category.id !== ignoreId &&
      category.type === type &&
      category.name.toLocaleLowerCase('es') === normalized,
  );
}

/** Crea una categoría validando nombre único por tipo. */
export async function createCategory(draft: CategoryDraft, existing: Category[]): Promise<string> {
  const name = validateRequiredText(draft.name, 'nombre', MAX_LENGTH.name);
  if (!name.ok) throw new Error(name.error);

  if (isCategoryNameTaken(name.value, draft.type, existing)) {
    throw new Error(`Ya existe una categoría llamada "${name.value}" en este tipo.`);
  }

  const description = cleanText(draft.description, MAX_LENGTH.notes);
  const timestamp = nowIso();

  return addDocument('categories', {
    type: draft.type,
    name: name.value,
    description,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

/** Actualiza el nombre o la descripción de una categoría. */
export async function updateCategory(
  category: Category,
  draft: CategoryDraft,
  existing: Category[],
): Promise<void> {
  const name = validateRequiredText(draft.name, 'nombre', MAX_LENGTH.name);
  if (!name.ok) throw new Error(name.error);

  if (isCategoryNameTaken(name.value, draft.type, existing, category.id)) {
    throw new Error(`Ya existe una categoría llamada "${name.value}" en este tipo.`);
  }

  await updateDocument('categories', category.id, {
    name: name.value,
    description: cleanText(draft.description, MAX_LENGTH.notes),
    updatedAt: nowIso(),
  });
}

/** Elimina una categoría. El llamado debe verificar que no esté en uso. */
export async function removeCategory(categoryId: string): Promise<void> {
  await deleteDocument('categories', categoryId);
}

/**
 * Crea las categorías base de la hoja de cálculo original la primera vez que
 * se abre la aplicación con Firestore vacío. Las categorías que ya existen
 * se omiten, de modo que también sirve para "restablecer" la lista base.
 */
export async function seedDefaultCategories(existing: Category[] = []): Promise<void> {
  const defaults: { type: TransactionType; name: string }[] = [
    ...DEFAULT_INCOME_CATEGORIES.map((name) => ({ type: 'ingreso' as TransactionType, name })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((name) => ({ type: 'gasto' as TransactionType, name })),
  ];
  const timestamp = nowIso();
  const pending = defaults.filter(
    (item) => !isCategoryNameTaken(item.name, item.type, existing),
  );

  await Promise.all(
    pending.map((item) =>
      addDocument('categories', {
        type: item.type,
        name: item.name,
        description: '',
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    ),
  );
}
