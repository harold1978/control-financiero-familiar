/**
 * Inicialización de Firebase (Firestore).
 *
 * La configuración se lee de variables de entorno con prefijo EXPO_PUBLIC_,
 * que Expo incrusta en el bundle en tiempo de compilación. Nunca se guardan
 * credenciales dentro del código fuente (ver .env.example).
 *
 * IMPORTANTE (seguridad): este proyecto funciona SIN autenticación por diseño,
 * por lo que la base de datos debe estar protegida con las reglas de
 * firestore.rules y, en producción, con Firebase App Check. Ver COMPLIANCE.md.
 */
import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { initializeFirestore, type Firestore } from 'firebase/firestore';

/** Variables mínimas que debe definir el usuario para usar Firestore. */
export const REQUIRED_FIREBASE_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

/** Error controlado cuando falta la configuración de Firebase. */
export class FirebaseNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(
      `Firebase no está configurado. Faltan variables: ${missing.join(', ')}. ` +
        'Copia .env.example a .env y completa los valores de tu proyecto de Firebase.',
    );
    this.name = 'FirebaseNotConfiguredError';
  }
}

function readConfig(): { config: FirebaseOptions | null; missing: string[] } {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  const missing: string[] = [];
  if (!apiKey) missing.push('EXPO_PUBLIC_FIREBASE_API_KEY');
  if (!projectId) missing.push('EXPO_PUBLIC_FIREBASE_PROJECT_ID');
  if (!appId) missing.push('EXPO_PUBLIC_FIREBASE_APP_ID');

  if (missing.length > 0) return { config: null, missing };

  const config: FirebaseOptions = {
    apiKey,
    projectId,
    appId,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? `${projectId}.appspot.com`,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  return { config, missing: [] };
}

const { config, missing } = readConfig();

/** Indica si la aplicación tiene credenciales de Firebase disponibles. */
export const isFirebaseConfigured = config !== null;

/** Lista de variables de entorno que faltan (para mostrar instrucciones). */
export const missingFirebaseKeys = missing;

let firebaseApp: FirebaseApp | null = null;
let database: Firestore | null = null;

/**
 * Devuelve la instancia de Firestore.
 * La inicialización es perezosa: no ocurre nada al importar el módulo,
 * lo que permite compilar y prerenderizar la app sin credenciales.
 */
export function getDb(): Firestore {
  if (!config) throw new FirebaseNotConfiguredError(missing);
  if (database) return database;

  if (firebaseApp === null) {
    firebaseApp = getApps()[0] ?? initializeApp(config);
  }

  // ForceLongPolling evita fallos de la capa WebChannel en algunas redes móviles.
  database = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true });
  return database;
}
