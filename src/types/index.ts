/**
 * Tipos de dominio del Control Financiero Familiar.
 *
 * La estructura replica la de la hoja de cálculo original:
 *  - Categorías (ingreso / gasto)
 *  - Ingresos (con periodicidad y control de uso)
 *  - Gastos (con quincena e ingreso asociado)
 *  - Presupuesto (monto sugerido por categoría)
 *  - Ajustes de la aplicación (moneda y consentimiento de privacidad)
 */

/** Tipo de categoría o transacción. */
export type TransactionType = 'ingreso' | 'gasto';

/** Periodicidades disponibles (mismas que la hoja de cálculo). */
export type Periodicity =
  | 'Diario'
  | 'Semanal'
  | 'Quincenal'
  | 'Mensual'
  | 'BiMensual'
  | 'Trimestral'
  | 'Cuatrimestral'
  | 'Semestral'
  | 'Anual';

/** Quincena a la que pertenece un gasto. */
export type Fortnight = 'Primera' | 'Segunda';

/** Categoría de ingreso o gasto. */
export interface Category {
  id: string;
  type: TransactionType;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/** Fuente de ingreso registrada. */
export interface Income {
  id: string;
  /** Código visible, por ejemplo I-001. */
  code: string;
  /** Fecha en formato ISO largo: YYYY-MM-DD. */
  date: string;
  description: string;
  categoryId: string;
  amount: number;
  periodicity: Periodicity;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Gasto registrado. */
export interface Expense {
  id: string;
  /** Código visible, por ejemplo G-001. */
  code: string;
  /** Fecha en formato ISO largo: YYYY-MM-DD. */
  date: string;
  description: string;
  categoryId: string;
  /** Ingreso del que se destinó el dinero (opcional). */
  incomeId: string | null;
  amount: number;
  fortnight: Fortnight;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Presupuesto de una categoría de gasto (uno por categoría). */
export interface Budget {
  /** El identificador del documento es el id de la categoría. */
  id: string;
  categoryId: string;
  suggestedAmount: number;
  periodicity: Periodicity;
  updatedAt: string;
}

/** Ajustes locales de la aplicación (no contienen datos financieros). */
export interface AppSettings {
  id: string;
  currency: string;
  /** Consentimiento del aviso de privacidad (GDPR art. 7). */
  privacyConsent: {
    accepted: boolean;
    policyVersion: string;
    acceptedAt: string | null;
  };
  updatedAt: string;
}

/** Colecciones de Firestore usadas por la aplicación. */
export type CollectionName = 'categories' | 'incomes' | 'expenses' | 'budgets' | 'settings';

/** Payload de exportación de datos (derecho de portabilidad). */
export interface ExportPayload {
  schemaVersion: number;
  exportedAt: string;
  application: string;
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
}
