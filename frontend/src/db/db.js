/**
 * Simple IndexedDB wrapper for offline engagement persistence.
 */
const DB_NAME = 'LogicLooperEngagement';
const DB_VERSION = 1;
const STORE_NAME = 'engagement_stats';

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

export const saveStats = async (stats) => {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put({ id: 'current_user_stats', ...stats, lastUpdated: new Date().toISOString() });
};

export const loadStats = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('current_user_stats');

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
