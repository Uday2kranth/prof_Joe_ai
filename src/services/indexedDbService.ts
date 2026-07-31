import type { ChatSession } from '../types';

const DB_NAME = 'chatterbot_codelab_db';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

export interface CodeLabDbSession extends ChatSession {
  userPresetKey: string; // e.g. "uday2_ml_science"
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('userPresetKey', 'userPresetKey', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCodeLabSession(username: string, presetId: string, session: ChatSession): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const dbRecord: CodeLabDbSession = {
      ...session,
      userPresetKey: `${username || 'guest'}_${presetId}`
    };

    store.put(dbRecord);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('IndexedDB saveCodeLabSession error:', e);
  }
}

export async function getCodeLabSessions(username: string, presetId: string): Promise<ChatSession[]> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('userPresetKey');
    const key = `${username || 'guest'}_${presetId}`;

    const request = index.getAll(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results: CodeLabDbSession[] = request.result || [];
        results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error('IndexedDB getCodeLabSessions error:', e);
    return [];
  }
}

export async function deleteCodeLabSession(sessionId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(sessionId);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error('IndexedDB deleteCodeLabSession error:', e);
  }
}
