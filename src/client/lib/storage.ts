// Wrappers seguros sobre Web Storage (localStorage / sessionStorage).
//
// El acceso a storage PUEDE lanzar excepción y romper el flujo de la app:
//  - Safari iOS en modo privado (lanza QuotaExceededError al escribir).
//  - Navegadores con cookies/almacenamiento bloqueado por el usuario.
//  - Storage lleno.
//  - Contextos donde `window.localStorage` ni siquiera es accesible (throw al leer la propiedad).
//
// Estas funciones NUNCA lanzan: ante un fallo logean a consola (no a la UI) y
// devuelven un valor de respaldo, de modo que la app siga funcionando en
// memoria (estado de React) como única fuente de verdad. El storage es solo
// una capa de persistencia OPCIONAL.

type StorageKind = "local" | "session";

function getStorage(kind: StorageKind): Storage | null {
  try {
    // Acceder a la propiedad puede lanzar en algunos navegadores/configuraciones.
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch (err) {
    console.warn(`[storage] ${kind}Storage no disponible:`, err);
    return null;
  }
}

export function safeStorageGet(kind: StorageKind, key: string): string | null {
  try {
    const storage = getStorage(kind);
    return storage ? storage.getItem(key) : null;
  } catch (err) {
    console.warn(`[storage] No se pudo leer "${key}" de ${kind}Storage:`, err);
    return null;
  }
}

export function safeStorageSet(kind: StorageKind, key: string, value: string): boolean {
  try {
    const storage = getStorage(kind);
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[storage] No se pudo guardar "${key}" en ${kind}Storage:`, err);
    return false;
  }
}

export function safeStorageRemove(kind: StorageKind, key: string): boolean {
  try {
    const storage = getStorage(kind);
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[storage] No se pudo borrar "${key}" de ${kind}Storage:`, err);
    return false;
  }
}

// Atajos por tipo de storage.
export const safeLocalGet = (key: string): string | null => safeStorageGet("local", key);
export const safeLocalSet = (key: string, value: string): boolean => safeStorageSet("local", key, value);
export const safeLocalRemove = (key: string): boolean => safeStorageRemove("local", key);

export const safeSessionGet = (key: string): string | null => safeStorageGet("session", key);
export const safeSessionSet = (key: string, value: string): boolean => safeStorageSet("session", key, value);
export const safeSessionRemove = (key: string): boolean => safeStorageRemove("session", key);
