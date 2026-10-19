/**
 * Constantes de la aplicación.
 * Aquí viven los catálogos fijos (periodicidades, monedas, categorías base)
 * y los parámetros de cálculo descritos en la hoja de cálculo original.
 */
import type { Fortnight, Periodicity } from '../types';

/** Versión del aviso de privacidad. Si cambia, se vuelve a pedir consentimiento. */
export const PRIVACY_POLICY_VERSION = '1.0';

/** Versión de la aplicación mostrada en "Ajustes". */
export const APP_VERSION = '1.0.0';

/** Orden de periodicidades (de más frecuente a menos frecuente). */
export const PERIODICITIES: Periodicity[] = [
  'Diario',
  'Semanal',
  'Quincenal',
  'Mensual',
  'BiMensual',
  'Trimestral',
  'Cuatrimestral',
  'Semestral',
  'Anual',
];

/**
 * Multiplicador para expresar un monto como si fuera mensual.
 *
 * La hoja de cálculo define: Mensual = 1, Anual = 1/12, Quincenal = 2,
 * Semanal = 4.33. Para el resto de periodicidades se usan los equivalentes
 * mensuales exactos (el archivo usaba 1 por defecto, lo que subestimaba
 * ingresos diarios o trimestrales).
 */
export const MONTH_FACTOR: Record<Periodicity, number> = {
  Diario: 30,
  Semanal: 4.33,
  Quincenal: 2,
  Mensual: 1,
  BiMensual: 0.5,
  Trimestral: 1 / 3,
  Cuatrimestral: 0.25,
  Semestral: 1 / 6,
  Anual: 1 / 12,
};

export const FORTNIGHTS: Fortnight[] = ['Primera', 'Segunda'];

/** Categorías de ingreso iniciales (hoja "Categorias"). */
export const DEFAULT_INCOME_CATEGORIES = [
  'Arriendo recibido',
  'Becas',
  'Bonos',
  'Freelance',
  'Inversiones',
  'Otros ingresos',
  'Salario',
];

/** Categorías de gasto iniciales (hoja "Categorias"). */
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Carnes',
  'Combustible',
  'Deudas y financiero',
  'Gallinas',
  'Internet',
  'Internet harold',
  'Otros gastos',
  'Perros',
  'Pollos',
  'Post Diana',
  'Post jose',
  'Servicios',
  'Suministros varios Casa',
  'Transporte',
  'Vehiculos',
  'Vivienda',
];

/** Umbrales de las recomendaciones automáticas del dashboard. */
export const SAVINGS_THRESHOLDS = {
  /** Tasa de ahorro considerada saludable. */
  healthy: 0.2,
  /** Tasa de ahorro mínima aceptable. */
  minimum: 0.1,
  /** Si los gastos superan este porcentaje del ingreso, hay riesgo alto. */
  highExpenseRatio: 0.8,
} as const;

/** Monedas disponibles (formato según la configuración regional del dispositivo). */
export const CURRENCIES: { code: string; label: string }[] = [
  { code: 'CRC', label: 'Colón costarricense (CRC)' },
  { code: 'USD', label: 'Dólar estadounidense (USD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'MXN', label: 'Peso mexicano (MXN)' },
  { code: 'COP', label: 'Peso colombiano (COP)' },
  { code: 'PEN', label: 'Sol peruano (PEN)' },
  { code: 'CLP', label: 'Peso chileno (CLP)' },
  { code: 'ARS', label: 'Peso argentino (ARS)' },
  { code: 'GTQ', label: 'Quetzal guatemalteco (GTQ)' },
  { code: 'HNL', label: 'Lempira hondureña (HNL)' },
  { code: 'NIO', label: 'Córdoba nicaragüense (NIO)' },
  { code: 'DOP', label: 'Peso dominicano (DOP)' },
  { code: 'PAB', label: 'Balboa panameño (PAB)' },
  { code: 'UYU', label: 'Peso uruguayo (UYU)' },
  { code: 'PYG', label: 'Guaraní paraguayo (PYG)' },
  { code: 'BRL', label: 'Real brasileño (BRL)' },
  { code: 'BOB', label: 'Boliviano (BOB)' },
  { code: 'ECU', label: 'Dólar ecuatoriano (USD)' },
];

/** Moneda por defecto: colón costarricense (datos del archivo original). */
export const DEFAULT_CURRENCY = 'CRC';

/** Límites de longitud para los campos de texto (minimización de datos). */
export const MAX_LENGTH = {
  name: 60,
  description: 120,
  notes: 400,
  code: 12,
} as const;

/** Elementos que muestra el dashboard en el ranking de gastos. */
export const TOP_EXPENSES_LIMIT = 5;

/** Longitud mínima de una frase de búsqueda. */
export const MIN_SEARCH_LENGTH = 1;
