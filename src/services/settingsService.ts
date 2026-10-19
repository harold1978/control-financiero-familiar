/** Operaciones sobre los ajustes de la aplicación (moneda y privacidad). */
import { DEFAULT_CURRENCY, PRIVACY_POLICY_VERSION } from '../constants/app';
import type { AppSettings } from '../types';
import { nowIso } from '../utils/dates';
import { mergeDocument, subscribeDocument, type DataHandlers } from './repository';
import { toSettings } from './mappers';

/** Identificador fijo del documento de ajustes. */
export const SETTINGS_DOCUMENT_ID = 'app';

/** Ajustes que se usan cuando todavía no existe el documento en Firestore. */
export function getDefaultSettings(): AppSettings {
  return {
    id: SETTINGS_DOCUMENT_ID,
    currency: DEFAULT_CURRENCY,
    privacyConsent: { accepted: false, policyVersion: '', acceptedAt: null },
    updatedAt: '',
  };
}

/** Suscripción en tiempo real a los ajustes. */
export function subscribeSettings(handlers: DataHandlers<AppSettings>): () => void {
  return subscribeDocument('settings', SETTINGS_DOCUMENT_ID, toSettings, handlers);
}

/** Guarda cambios parciales en los ajustes. */
export async function updateSettings(patch: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  await mergeDocument('settings', SETTINGS_DOCUMENT_ID, { ...patch, updatedAt: nowIso() });
}

/**
 * Registra el consentimiento del aviso de privacidad.
 * Se guarda la versión aceptada y la fecha como constancia (RGPD art. 7).
 */
export async function acceptPrivacyPolicy(): Promise<void> {
  await mergeDocument('settings', SETTINGS_DOCUMENT_ID, {
    privacyConsent: {
      accepted: true,
      policyVersion: PRIVACY_POLICY_VERSION,
      acceptedAt: nowIso(),
    },
    updatedAt: nowIso(),
  });
}

/** Retira el consentimiento (el aviso volverá a mostrarse). */
export async function revokePrivacyPolicy(): Promise<void> {
  await mergeDocument('settings', SETTINGS_DOCUMENT_ID, {
    privacyConsent: { accepted: false, policyVersion: '', acceptedAt: null },
    updatedAt: nowIso(),
  });
}
