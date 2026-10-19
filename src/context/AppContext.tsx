/**
 * Contexto global de la aplicación.
 *
 * centraliza:
 *  - la suscripción en tiempo real a Firestore (solo lectura inicial + cambios),
 *  - las colecciones en memoria,
 *  - los cálculos del dashboard,
 *  - las acciones de alta, edición y borrado,
 *  - el estado de privacidad y los datos de exportación.
 *
 * No hay autenticación de usuarios por requisito del proyecto: toda la
 * información vive en el proyecto de Firebase que configure quien instale la app.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { isFirebaseConfigured, missingFirebaseKeys } from '../config/firebase';
import { PRIVACY_POLICY_VERSION } from '../constants/app';
import { deleteAllDocuments } from '../services/repository';
import {
  createCategory,
  removeCategory,
  seedDefaultCategories,
  subscribeCategories,
  updateCategory,
  type CategoryDraft,
} from '../services/categoriesService';
import {
  createIncome,
  removeIncome,
  subscribeIncomes,
  updateIncome,
  type IncomeDraft,
} from '../services/incomesService';
import {
  createExpense,
  removeExpense,
  subscribeExpenses,
  updateExpense,
  type ExpenseDraft,
} from '../services/expensesService';
import { saveBudget, subscribeBudgets, type BudgetDraft } from '../services/budgetsService';
import {
  acceptPrivacyPolicy,
  getDefaultSettings,
  revokePrivacyPolicy,
  subscribeSettings,
  updateSettings,
} from '../services/settingsService';
import type { AppSettings, Budget, Category, Expense, Income } from '../types';
import { buildCategoryNames, buildDashboard, type DashboardData } from '../utils/calculations';

/** Colecciones que deben entregar su primera lectura para terminar la carga. */
const INITIAL_STATE = {
  categories: false,
  incomes: false,
  expenses: false,
  budgets: false,
  settings: false,
};

/** Evita sembrar las categorías base más de una vez por sesión. */
let defaultCategoriesSeeded = false;

export interface AppContextValue {
  /** false cuando faltan las variables de entorno de Firebase. */
  configured: boolean;
  /** Variables de entorno que faltan (para mostrar instrucciones). */
  missingKeys: string[];
  /** true mientras Firestore no ha terminado la primera lectura. */
  loading: boolean;
  /** Primer mensaje de error de conexión, si lo hay. */
  error: string | null;
  /** Fuerza una nueva lectura eliminando el estado de error. */
  reload: () => void;

  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  settings: AppSettings;
  /** Moneda seleccionada en los ajustes. */
  currency: string;
  /** Mapa id -> nombre de categoría. */
  categoryNames: Map<string, string>;
  /** Indicadores calculados del dashboard. */
  dashboard: DashboardData;
  /** true cuando hay que volver a mostrar el aviso de privacidad. */
  privacyPending: boolean;

  addCategory: (draft: CategoryDraft) => Promise<string>;
  editCategory: (category: Category, draft: CategoryDraft) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  restoreDefaultCategories: () => Promise<void>;

  addIncome: (draft: IncomeDraft) => Promise<string>;
  editIncome: (income: Income, draft: IncomeDraft) => Promise<void>;
  deleteIncome: (incomeId: string) => Promise<void>;

  addExpense: (draft: ExpenseDraft) => Promise<string>;
  editExpense: (expense: Expense, draft: ExpenseDraft) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;

  setBudget: (categoryId: string, draft: BudgetDraft) => Promise<void>;

  saveCurrency: (currency: string) => Promise<void>;
  acceptPrivacy: () => Promise<void>;
  revokePrivacy: () => Promise<void>;
  deleteAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => getDefaultSettings());
  const [loaded, setLoaded] = useState(INITIAL_STATE);
  const [sourceErrors, setSourceErrors] = useState<Record<string, string>>({});

  const markLoaded = useCallback((source: keyof typeof INITIAL_STATE) => {
    setLoaded((current) => (current[source] ? current : { ...current, [source]: true }));
  }, []);

  const handleData = useCallback(
    (source: keyof typeof INITIAL_STATE, apply: () => void) => {
      apply();
      markLoaded(source);
      setSourceErrors((current) => {
        if (!current[source]) return current;
        const next = { ...current };
        delete next[source];
        return next;
      });
    },
    [markLoaded],
  );

  const handleError = useCallback((source: keyof typeof INITIAL_STATE, error: Error) => {
    setSourceErrors((current) => ({ ...current, [source]: error.message }));
  }, []);

  const handleCategories = useCallback(
    (items: Category[]) => {
      handleData('categories', () => setCategories(items));
      // Primera apertura con la base vacía: se crean las categorías de la hoja original.
      if (items.length === 0 && !defaultCategoriesSeeded) {
        defaultCategoriesSeeded = true;
        seedDefaultCategories([]).catch((error) => {
          console.warn('No se pudieron crear las categorías base:', error);
        });
      }
    },
    [handleData],
  );

  const handleIncomes = useCallback(
    (items: Income[]) => handleData('incomes', () => setIncomes(items)),
    [handleData],
  );
  const handleExpenses = useCallback(
    (items: Expense[]) => handleData('expenses', () => setExpenses(items)),
    [handleData],
  );
  const handleBudgets = useCallback(
    (items: Budget[]) => handleData('budgets', () => setBudgets(items)),
    [handleData],
  );
  const handleSettings = useCallback(
    (items: AppSettings[]) =>
      handleData('settings', () => setSettings(items[0] ?? getDefaultSettings())),
    [handleData],
  );

  const subscribeToSources = useCallback(() => {
    if (!isFirebaseConfigured) return () => undefined;

    const unsubscribes = [
      subscribeCategories({
        onData: handleCategories,
        onError: (error) => handleError('categories', error),
      }),
      subscribeIncomes({
        onData: handleIncomes,
        onError: (error) => handleError('incomes', error),
      }),
      subscribeExpenses({
        onData: handleExpenses,
        onError: (error) => handleError('expenses', error),
      }),
      subscribeBudgets({
        onData: handleBudgets,
        onError: (error) => handleError('budgets', error),
      }),
      subscribeSettings({
        onData: handleSettings,
        onError: (error) => handleError('settings', error),
      }),
    ];

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [handleBudgets, handleCategories, handleExpenses, handleIncomes, handleSettings, handleError]);

  const unsubscribeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    unsubscribeRef.current = subscribeToSources();
    return () => unsubscribeRef.current();
  }, [subscribeToSources]);

  const reload = useCallback(() => {
    setSourceErrors({});
    setLoaded(INITIAL_STATE);
    unsubscribeRef.current();
    unsubscribeRef.current = subscribeToSources();
  }, [subscribeToSources]);

  const error = useMemo(() => Object.values(sourceErrors)[0] ?? null, [sourceErrors]);
  const loading =
    isFirebaseConfigured &&
    error === null &&
    Object.values(loaded).some((value) => !value);

  const categoryNames = useMemo(() => buildCategoryNames(categories), [categories]);
  const dashboard = useMemo(
    () => buildDashboard({ categories, incomes, expenses, budgets }),
    [categories, incomes, expenses, budgets],
  );
  const privacyPending =
    settings.privacyConsent.accepted !== true ||
    settings.privacyConsent.policyVersion !== PRIVACY_POLICY_VERSION;

  /* ------------------------------ Categorías ----------------------------- */

  const addCategory = useCallback(
    (draft: CategoryDraft) => createCategory(draft, categories),
    [categories],
  );
  const editCategory = useCallback(
    (category: Category, draft: CategoryDraft) => updateCategory(category, draft, categories),
    [categories],
  );
  const deleteCategory = useCallback(
    async (categoryId: string) => {
      const inUse =
        incomes.some((income) => income.categoryId === categoryId) ||
        expenses.some((expense) => expense.categoryId === categoryId);

      if (inUse) {
        throw new Error('No se puede eliminar: hay ingresos o gastos que usan esta categoría.');
      }
      await removeCategory(categoryId);
    },
    [incomes, expenses],
  );
  const restoreDefaultCategories = useCallback(
    () => seedDefaultCategories(categories),
    [categories],
  );

  /* ------------------------------- Ingresos ------------------------------ */

  const addIncome = useCallback((draft: IncomeDraft) => createIncome(draft, incomes), [incomes]);
  const editIncome = useCallback(
    (income: Income, draft: IncomeDraft) => updateIncome(income, draft),
    [],
  );
  const deleteIncome = useCallback((incomeId: string) => removeIncome(incomeId), []);

  /* -------------------------------- Gastos ------------------------------- */

  const addExpense = useCallback((draft: ExpenseDraft) => createExpense(draft, expenses), [expenses]);
  const editExpense = useCallback(
    (expense: Expense, draft: ExpenseDraft) => updateExpense(expense, draft),
    [],
  );
  const deleteExpense = useCallback((expenseId: string) => removeExpense(expenseId), []);

  /* ------------------------------ Presupuesto ---------------------------- */

  const setBudget = useCallback(
    (categoryId: string, draft: BudgetDraft) => saveBudget(categoryId, draft),
    [],
  );

  /* --------------------------- Ajustes y privacidad ---------------------- */

  const saveCurrency = useCallback((currency: string) => updateSettings({ currency }), []);
  const acceptPrivacy = useCallback(() => acceptPrivacyPolicy(), []);
  const revokePrivacy = useCallback(() => revokePrivacyPolicy(), []);

  const deleteAllData = useCallback(async () => {
    for (const name of ['incomes', 'expenses', 'budgets', 'categories', 'settings'] as const) {
      await deleteAllDocuments(name);
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      configured: isFirebaseConfigured,
      missingKeys: missingFirebaseKeys,
      loading,
      error,
      reload,
      categories,
      incomes,
      expenses,
      budgets,
      settings,
      currency: settings.currency,
      categoryNames,
      dashboard,
      privacyPending,
      addCategory,
      editCategory,
      deleteCategory,
      restoreDefaultCategories,
      addIncome,
      editIncome,
      deleteIncome,
      addExpense,
      editExpense,
      deleteExpense,
      setBudget,
      saveCurrency,
      acceptPrivacy,
      revokePrivacy,
      deleteAllData,
    }),
    [
      loading,
      error,
      reload,
      categories,
      incomes,
      expenses,
      budgets,
      settings,
      categoryNames,
      dashboard,
      privacyPending,
      addCategory,
      editCategory,
      deleteCategory,
      restoreDefaultCategories,
      addIncome,
      editIncome,
      deleteIncome,
      addExpense,
      editExpense,
      deleteExpense,
      setBudget,
      saveCurrency,
      acceptPrivacy,
      revokePrivacy,
      deleteAllData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Acceso al contexto. Lanza un error claro si se usa fuera del proveedor. */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de <AppProvider>.');
  }
  return context;
}
