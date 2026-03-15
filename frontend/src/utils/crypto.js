import CryptoJS from 'crypto-js';

const APP_SECRET = import.meta.env.VITE_PUZZLE_SECRET_KEY || 'bluestock_secret_2026';

/**
 * A simple seeded Pseudo-Random Number Generator (PRNG).
 * Used to ensure every player gets the exact same generated puzzle on a given day.
 */
class SeededRandom {
    constructor(seedString) {
        // Secret key ensures seeds are unique to our app and not purely sequential
        const SECRET_KEY = import.meta.env.VITE_PUZZLE_SECRET_KEY || 'bluestock_secret_2026';
        
        // Hash the date string (e.g., '2024-10-25') + secret into a numerical seed
        const hash = CryptoJS.SHA256(seedString + SECRET_KEY).toString(CryptoJS.enc.Hex);
        // Take the first 8 characters of the hex hash and convert to integer
        this.seed = parseInt(hash.substring(0, 8), 16);
    }

    /**
     * Generates the next pseudo-random floating point number between [0, 1)
     * Uses a basic Linear Congruential Generator (LCG) algorithm.
     */
    next() {
        // LCG parameters (glibc style)
        const a = 1103515245;
        const c = 12345;
        const m = 2 ** 31;

        this.seed = (a * this.seed + c) % m;
        return this.seed / m;
    }

    /**
     * Returns a random integer between min (inclusive) and max (exclusive).
     */
    range(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    /**
     * Randomly shuffles an array in-place using the Fisher-Yates algorithm.
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.range(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

/**
 * encryptData - Encrypts a JS object or string using AES
 */
export const encryptData = (data) => {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonStr, APP_SECRET).toString();
};

/**
 * decryptData - Decrypts an AES string back to a JS object or string
 */
export const decryptData = (encrypted) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, APP_SECRET);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(originalText);
    } catch (e) {
        return null;
    }
};

/**
 * generateScoreHash - Creates a secure signature for a score submission
 */
export const generateScoreHash = (userId, score, timeTaken, seed) => {
    const payload = `${userId}:${score}:${timeTaken}:${seed}:${APP_SECRET}`;
    return CryptoJS.SHA256(payload).toString();
};

export default SeededRandom;
