/**
 * Repositorio genérico de Firestore.
 *
 * Todas las lecturas y escrituras pasan por aquí para mantener un único
 * punto de acceso a la base de datos. Las consultas se ordenan en el cliente
 * con `sortDocuments`, de modo que no es necesario crear índices compuestos.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDb } from '../config/firebase';
import type { CollectionName } from '../types';

export type DocumentMapper<T> = (id: string, data: DocumentData) => T;
export type DataHandlers<T> = {
  onData: (items: T[]) => void;
  onError: (error: Error) => void;
};

/** Traduce los errores de Firebase a mensajes comprensibles en español. */
export function toFriendlyError(error: unknown): Error {
  if (error instanceof Error) {
    const code = (error as Error & { code?: string }).code ?? '';
    const messages: Record<string, string> = {
      'permission-denied': 'Firestore rechazó la operación. Revisa las reglas de seguridad del proyecto.',
      unavailable: 'No se pudo conectar con Firestore. Verifica tu conexión a internet.',
      'invalid-api-key': 'La clave de API de Firebase no es válida.',
      'project-not-found': 'El proyecto de Firebase no existe o no es accesible.',
      'failed-precondition': 'La operación no se pudo completar. Revisa el estado de los datos.',
      unimplemented: 'La operación no está disponible en la configuración actual de Firestore.',
    };
    return new Error(messages[code] ?? error.message);
  }
  return new Error('Ocurrió un error inesperado.');
}

/** Suscripción en tiempo real a una colección completa. */
export function subscribeCollection<T>(
  name: CollectionName,
  mapper: DocumentMapper<T>,
  handlers: DataHandlers<T>,
): () => void {
  return onSnapshot(
    collection(getDb(), name),
    (snapshot) => {
      const items = snapshot.docs.map((document: QueryDocumentSnapshot) =>
        mapper(document.id, document.data()),
      );
      handlers.onData(items);
    },
    (error) => handlers.onError(toFriendlyError(error)),
  );
}

/** Suscripción en tiempo real a un documento concreto. */
export function subscribeDocument<T>(
  name: CollectionName,
  id: string,
  mapper: DocumentMapper<T>,
  handlers: DataHandlers<T>,
): () => void {
  return onSnapshot(
    doc(getDb(), name, id),
    (snapshot) => {
      handlers.onData(snapshot.exists() ? [mapper(snapshot.id, snapshot.data())] : []);
    },
    (error) => handlers.onError(toFriendlyError(error)),
  );
}

/** Lectura puntual de una colección (se usa para exportar y sembrar datos). */
export async function fetchCollection<T>(name: CollectionName, mapper: DocumentMapper<T>): Promise<T[]> {
  const snapshot = await getDocs(collection(getDb(), name));
  return snapshot.docs.map((document) => mapper(document.id, document.data()));
}

/** Crea un documento con id autogenerado y devuelve su identificador. */
export async function addDocument(name: CollectionName, data: DocumentData): Promise<string> {
  const reference = await addDoc(collection(getDb(), name), data);
  return reference.id;
}

/** Sobrescribe un documento completo. */
export async function setDocument(name: CollectionName, id: string, data: DocumentData): Promise<void> {
  await setDoc(doc(getDb(), name, id), data);
}

/** Actualiza solo los campos indicados (los demás conservan su valor). */
export async function updateDocument(
  name: CollectionName,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  await updateDoc(doc(getDb(), name, id), data);
}

/** Crea o actualiza un documento conservando los campos no enviados. */
export async function mergeDocument(
  name: CollectionName,
  id: string,
  data: DocumentData,
): Promise<void> {
  await setDoc(doc(getDb(), name, id), data, { merge: true });
}

/** Elimina un documento. */
export async function deleteDocument(name: CollectionName, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), name, id));
}

/**
 * Elimina todos los documentos de una colección (derecho de supresión).
 * Firestore permite un máximo de 500 operaciones por lote.
 */
export async function deleteAllDocuments(name: CollectionName): Promise<number> {
  const snapshot = await getDocs(collection(getDb(), name));
  const documents = snapshot.docs;
  const db = getDb();
  const CHUNK_SIZE = 400;

  for (let index = 0; index < documents.length; index += CHUNK_SIZE) {
    const batch = writeBatch(db);
    documents.slice(index, index + CHUNK_SIZE).forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }

  return documents.length;
}

/** Ordena documentos por fecha (descendente) y después por código ascendente. */
export function sortDocuments<T extends { date?: string; code?: string; name?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const dateOrder = (b.date ?? '').localeCompare(a.date ?? '');
    if (dateOrder !== 0) return dateOrder;
    const codeOrder = (a.code ?? '').localeCompare(b.code ?? '');
    if (codeOrder !== 0) return codeOrder;
    return (a.name ?? '').localeCompare(b.name ?? '', 'es');
  });
}
