import LZString from 'lz-string';

/**
 * StorageManager: Centralized utility for compressed LocalStorage interactions.
 */
class StorageManager {
    /**
     * Saves data to LocalStorage after JSON stringification and LZ compression.
     * @param {string} key 
     * @param {any} value 
     */
    static setItem(key, value) {
        try {
            const stringified = JSON.stringify(value);
            const compressed = LZString.compressToUTF16(stringified);
            localStorage.setItem(key, compressed);
        } catch (error) {
            console.error(`StorageManager save error for key "${key}":`, error);
        }
    }

    /**
     * Loads and decompresses data from LocalStorage.
     * @param {string} key 
     * @returns {any|null}
     */
    static getItem(key) {
        try {
            const compressed = localStorage.getItem(key);
            if (!compressed) return null;

            // Try decompressing. Check if it looks like compressed data or raw JSON (for migration)
            let decompressed = LZString.decompressFromUTF16(compressed);
            
            // Fallback for non-compressed legacy data
            if (!decompressed) {
                decompressed = compressed;
            }

            return JSON.parse(decompressed);
        } catch (error) {
            console.error(`StorageManager load error for key "${key}":`, error);
            return null;
        }
    }

    /**
     * Removes an item from LocalStorage.
     * @param {string} key 
     */
    static removeItem(key) {
        localStorage.removeItem(key);
    }
}

export default StorageManager;
