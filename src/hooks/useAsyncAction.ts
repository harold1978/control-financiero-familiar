/**
 * Ejecuta una acción asincrónica (guardar, eliminar, exportar) controlando
 * los estados de "ocupado" y "error" sin repetir try/catch en cada pantalla.
 */
import { useCallback, useState } from 'react';
import { toFriendlyError } from '../services/repository';

export interface AsyncActionState {
  /** true mientras la operación está en curso (para deshabilitar botones). */
  busy: boolean;
  /** Mensaje de error en español, o null si no hay errores. */
  error: string | null;
  /** Limpia el mensaje de error. */
  clearError: () => void;
  /** Ejecuta la operación y devuelve true si terminó bien. */
  run: (action: () => Promise<unknown>) => Promise<boolean>;
}

export function useAsyncAction(): AsyncActionState {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (actionError) {
      setError(toFriendlyError(actionError).message);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { busy, error, clearError, run };
}
