import CryptoJS from 'crypto-js';

/**
 * A simple seeded Pseudo-Random Number Generator (PRNG).
 * Used to ensure every player gets the exact same generated puzzle on a given day.
 */
class SeededRandom {
    constructor(seedString) {
        // Hash the date string (e.g., '2024-10-25') into a numerical seed
        const hash = CryptoJS.SHA256(seedString).toString(CryptoJS.enc.Hex);
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

export default SeededRandom;
