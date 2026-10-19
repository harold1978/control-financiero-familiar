/**
 * Conversión de documentos de Firestore a tipos de dominio.
 *
 * Toda lectura pasa por aquí para que un documento ausente o con campos
 * corruptos nunca rompa la interfaz: siempre se devuelve un valor por defecto.
 */
import type { DocumentData } from 'firebase/firestore';
import { DEFAULT_CURRENCY, FORTNIGHTS, PERIODICITIES } from '../constants/app';
import type { AppSettings, Budget, Category, Expense, Fortnight, Income, Periodicity, TransactionType } from '../types';

export function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function readPeriodicity(value: unknown): Periodicity {
  const text = readString(value, 'Mensual');
  return (PERIODICITIES as string[]).includes(text) ? (text as Periodicity) : 'Mensual';
}

export function readFortnight(value: unknown): Fortnight {
  const text = readString(value, 'Primera');
  return (FORTNIGHTS as string[]).includes(text) ? (text as Fortnight) : 'Primera';
}

export function readTransactionType(value: unknown): TransactionType {
  return readString(value, 'gasto') === 'ingreso' ? 'ingreso' : 'gasto';
}

export function toCategory(id: string, data: DocumentData): Category {
  return {
    id,
    type: readTransactionType(data.type),
    name: readString(data.name, 'Sin nombre'),
    description: readString(data.description),
    createdAt: readString(data.createdAt),
    updatedAt: readString(data.updatedAt),
  };
}

export function toIncome(id: string, data: DocumentData): Income {
  return {
    id,
    code: readString(data.code, 'S/N'),
    date: readString(data.date),
    description: readString(data.description, 'Ingreso sin descripción'),
    categoryId: readString(data.categoryId),
    amount: readNumber(data.amount),
    periodicity: readPeriodicity(data.periodicity),
    notes: readString(data.notes),
    createdAt: readString(data.createdAt),
    updatedAt: readString(data.updatedAt),
  };
}

export function toExpense(id: string, data: DocumentData): Expense {
  return {
    id,
    code: readString(data.code, 'S/N'),
    date: readString(data.date),
    description: readString(data.description, 'Gasto sin descripción'),
    categoryId: readString(data.categoryId),
    incomeId: readNullableString(data.incomeId),
    amount: readNumber(data.amount),
    fortnight: readFortnight(data.fortnight),
    notes: readString(data.notes),
    createdAt: readString(data.createdAt),
    updatedAt: readString(data.updatedAt),
  };
}

export function toBudget(id: string, data: DocumentData): Budget {
  return {
    id,
    categoryId: readString(data.categoryId, id),
    suggestedAmount: readNumber(data.suggestedAmount),
    periodicity: readPeriodicity(data.periodicity),
    updatedAt: readString(data.updatedAt),
  };
}

export function toSettings(id: string, data: DocumentData): AppSettings {
  const consent = (data.privacyConsent ?? {}) as Record<string, unknown>;
  return {
    id,
    currency: readString(data.currency, DEFAULT_CURRENCY),
    privacyConsent: {
      accepted: consent.accepted === true,
      policyVersion: readString(consent.policyVersion),
      acceptedAt: readString(consent.acceptedAt) || null,
    },
    updatedAt: readString(data.updatedAt),
  };
}
