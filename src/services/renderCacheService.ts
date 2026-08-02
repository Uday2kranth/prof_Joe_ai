/**
 * IndexedDB Render & SVG Cache Service for Prof. Joe AI
 * Persists pre-rendered markdown/math HTML and Kroki diagram SVGs locally in browser IndexedDB.
 * Bypasses 5MB localStorage limits to allow instant message hydration & zero-latency tab switching.
 */

const DB_NAME = 'ProfJoeRenderCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'render_cache';

interface CacheEntry {
  key: string;
  value: string;
  timestamp: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result as IDBDatabase);
      };

      request.onerror = (event: any) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  return dbPromise;
}

/**
 * Retrieves cached rendered string from IndexedDB
 */
export async function getRenderCache(key: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CacheEntry | undefined;
        if (result && result.value) {
          resolve(result.value);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (e) {
    return null;
  }
}

/**
 * Saves rendered string into IndexedDB
 */
export async function setRenderCache(key: string, value: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const entry: CacheEntry = {
        key,
        value,
        timestamp: Date.now()
      };
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch (e) {
    // Fail gracefully without breaking execution
  }
}

/**
 * Clears old cache entries if needed
 */
export async function clearRenderCache(): Promise<void> {
  try {
    const db = await getDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
  } catch (e) {
    console.error('Failed to clear render cache', e);
  }
}
