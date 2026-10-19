/**
 * Cálculos financieros de la aplicación.
 *
 * Reproduce las fórmulas de la hoja de cálculo original ("Dashboard" y "Presupuesto"):
 *
 *  Ingresos mensuales  = Σ (monto × factor de periodicidad)
 *  Ingresos anuales    = ingresos mensuales × 12
 *  Gastos mensuales    = Σ (monto de cada gasto registrado)
 *  Gastos anuales      = gastos mensuales × 12
 *  Balance mensual     = ingresos mensuales − gastos mensuales
 *  Tasa de ahorro      = balance / ingresos mensuales
 *  Gasto sobre ingreso = gastos / ingresos mensuales
 *  Gasto diario        = balance / 30
 *
 * Nota: los gastos no se normalizan por periodicidad porque representan
 * movimientos reales ya registrados; la periodicidad del presupuesto describe
 * el ciclo de la cuántía sugerida, no una compra recurrente.
 */
import { MONTH_FACTOR, PERIODICITIES, SAVINGS_THRESHOLDS, TOP_EXPENSES_LIMIT } from '../constants/app';
import type { Tone } from '../styles/styles';
import type { Budget, Category, Expense, Income, Periodicity } from '../types';

export interface DashboardInput {
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
}

export interface BalanceSummary {
  incomeMonthly: number;
  incomeAnnual: number;
  incomeSources: number;
  expenseMonthly: number;
  expenseAnnual: number;
  expenseCount: number;
  balanceMonthly: number;
  savingsRate: number;
  expenseRatio: number;
  dailyCapacity: number;
  statusLabel: string;
  statusTone: Tone;
}

export interface CategorySpending {
  categoryId: string;
  name: string;
  amount: number;
  /** Porcentaje que representa este concepto sobre el total de gastos. */
  expenseShare: number;
  /** Porcentaje que representa este concepto sobre el total de ingresos. */
  incomeShare: number;
}

export interface PeriodicitySpending {
  periodicity: Periodicity;
  actual: number;
  projected: number;
}

export interface TopExpense {
  rank: number;
  expense: Expense;
}

export interface Recommendation {
  id: string;
  text: string;
  tone: Tone;
}

export interface BudgetRow {
  categoryId: string;
  name: string;
  suggestedAmount: number;
  real: number;
  difference: number;
  periodicity: Periodicity;
  overBudget: boolean;
  incomeShare: number;
}

export interface DashboardData {
  summary: BalanceSummary;
  byCategory: CategorySpending[];
  byPeriodicity: PeriodicitySpending[];
  topExpenses: TopExpense[];
  recommendations: Recommendation[];
}

/** Suma de ingresos expresados como si fueran mensuales. */
export function sumMonthlyIncome(incomes: Income[]): number {
  return incomes.reduce((total, income) => {
    const factor = MONTH_FACTOR[income.periodicity] ?? 1;
    return total + income.amount * factor;
  }, 0);
}

/** Suma simple de todos los gastos registrados. */
export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

/** Dinero de un ingreso que ya fue destinado a gastos. */
export function getIncomeUsage(income: Income, expenses: Expense[]): number {
  return expenses
    .filter((expense) => expense.incomeId === income.id)
    .reduce((total, expense) => total + expense.amount, 0);
}

/** Relación de uso de un ingreso (0 a 1) para la gráfica de 10 puntos. */
export function getIncomeUsageRatio(income: Income, expenses: Expense[]): number {
  if (income.amount <= 0) return 0;
  return Math.min(getIncomeUsage(income, expenses) / income.amount, 1);
}

/** Mapa id -> nombre de categoría. */
export function buildCategoryNames(categories: Category[]): Map<string, string> {
  return new Map(categories.map((category) => [category.id, category.name]));
}

/** Semáforo del balance mensual (mismos textos que la hoja original). */
export function getBalanceStatus(savingsRate: number): { label: string; tone: Tone } {
  if (savingsRate >= SAVINGS_THRESHOLDS.healthy) {
    return { label: '🟢 Excelente ahorro (≥20%)', tone: 'success' };
  }
  if (savingsRate >= SAVINGS_THRESHOLDS.minimum) {
    return { label: '🟡 Ahorro aceptable (10-20%)', tone: 'warning' };
  }
  if (savingsRate >= 0) {
    return { label: '🟠 Ajustar gastos (0-10%)', tone: 'info' };
  }
  return { label: '🔴 Déficit - acción urgente', tone: 'danger' };
}

/** Recomendaciones automáticas (reglas de la hoja original). */
export function buildRecommendations(savingsRate: number, expenseRatio: number): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (savingsRate >= SAVINGS_THRESHOLDS.healthy) {
    recommendations.push({
      id: 'savings-high',
      tone: 'success',
      text: 'Ahorras más del 20%. Considera invertir el excedente.',
    });
  } else if (savingsRate >= SAVINGS_THRESHOLDS.minimum) {
    recommendations.push({
      id: 'savings-medium',
      tone: 'warning',
      text: 'Ahorro entre 10% y 20%. Meta recomendada: 20%.',
    });
  } else if (savingsRate >= 0) {
    recommendations.push({
      id: 'savings-low',
      tone: 'warning',
      text: 'Ahorro bajo. Revisa gastos variables y suscripciones.',
    });
  } else {
    recommendations.push({
      id: 'deficit',
      tone: 'danger',
      text: 'Déficit mensual. Prioriza recortes en categorías no esenciales, por ejemplo "Otros gastos".',
    });
  }

  if (expenseRatio > SAVINGS_THRESHOLDS.highExpenseRatio) {
    recommendations.push({
      id: 'high-expense',
      tone: 'danger',
      text: 'Tus gastos superan el 80% del ingreso. Riesgo alto.',
    });
  }

  return recommendations;
}

/**
 * Filas del presupuesto: una por categoría de gasto.
 * Si la categoría todavía no tiene presupuesto guardado se muestra en 0.
 */
export function buildBudgetRows(input: DashboardInput): BudgetRow[] {
  const { categories, budgets, expenses, incomes } = input;
  const budgetByCategory = new Map(budgets.map((budget) => [budget.categoryId, budget]));
  const spentByCategory = new Map<string, number>();

  for (const expense of expenses) {
    spentByCategory.set(expense.categoryId, (spentByCategory.get(expense.categoryId) ?? 0) + expense.amount);
  }

  const incomeMonthly = sumMonthlyIncome(incomes);

  return categories
    .filter((category) => category.type === 'gasto')
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map((category) => {
      const budget = budgetByCategory.get(category.id);
      const suggestedAmount = budget?.suggestedAmount ?? 0;
      const real = spentByCategory.get(category.id) ?? 0;

      return {
        categoryId: category.id,
        name: category.name,
        suggestedAmount,
        real,
        difference: suggestedAmount - real,
        periodicity: budget?.periodicity ?? 'Mensual',
        overBudget: suggestedAmount > 0 && real > suggestedAmount,
        incomeShare: incomeMonthly > 0 ? real / incomeMonthly : 0,
      };
    });
}

/** Construye todos los indicadores del dashboard. */
export function buildDashboard(input: DashboardInput): DashboardData {
  const { incomes, expenses, categories } = input;

  const incomeMonthly = sumMonthlyIncome(incomes);
  const expenseMonthly = sumExpenses(expenses);
  const balanceMonthly = incomeMonthly - expenseMonthly;
  const savingsRate = incomeMonthly === 0 ? 0 : balanceMonthly / incomeMonthly;
  const expenseRatio = incomeMonthly === 0 ? 0 : expenseMonthly / incomeMonthly;
  const status = getBalanceStatus(incomeMonthly === 0 ? 0 : savingsRate);

  const summary: BalanceSummary = {
    incomeMonthly,
    incomeAnnual: incomeMonthly * 12,
    incomeSources: incomes.length,
    expenseMonthly,
    expenseAnnual: expenseMonthly * 12,
    expenseCount: expenses.length,
    balanceMonthly,
    savingsRate,
    expenseRatio,
    dailyCapacity: balanceMonthly / 30,
    statusLabel: status.label,
    statusTone: status.tone,
  };

  const budgetRows = buildBudgetRows(input);

  // Gasto por categoría: se muestran todas las categorías, incluso las en cero.
  const spentByCategory = new Map<string, number>();
  for (const expense of expenses) {
    spentByCategory.set(expense.categoryId, (spentByCategory.get(expense.categoryId) ?? 0) + expense.amount);
  }

  const byCategory: CategorySpending[] = categories
    .filter((category) => category.type === 'gasto')
    .map((category) => {
      const amount = spentByCategory.get(category.id) ?? 0;
      return {
        categoryId: category.id,
        name: category.name,
        amount,
        expenseShare: expenseMonthly > 0 ? amount / expenseMonthly : 0,
        incomeShare: incomeMonthly > 0 ? amount / incomeMonthly : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name, 'es'));

  // Gasto por periodicidad: agrupa las filas del presupuesto (igual que SUMIF).
  const byPeriodicity: PeriodicitySpending[] = PERIODICITIES.map((periodicity) => {
    const rows = budgetRows.filter((row) => row.periodicity === periodicity);
    return {
      periodicity,
      actual: rows.reduce((total, row) => total + row.real, 0),
      projected: rows.reduce((total, row) => total + row.suggestedAmount, 0),
    };
  });

  const topExpenses: TopExpense[] = [...expenses]
    .sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date))
    .slice(0, TOP_EXPENSES_LIMIT)
    .map((expense, index) => ({ rank: index + 1, expense }));

  return {
    summary,
    byCategory,
    byPeriodicity,
    topExpenses,
    recommendations: buildRecommendations(summary.savingsRate, summary.expenseRatio),
  };
}
