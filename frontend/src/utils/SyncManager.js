import axios from 'axios';
import StorageManager from './StorageManager';

const SYNC_QUEUE_KEY = 'sync_score_queue';
const BATCH_SIZE = 1;

/**
 * SyncManager: Handles batched API updates to minimize database writes.
 */
class SyncManager {
    static async queueScore(scoreData) {
        const queue = StorageManager.getItem(SYNC_QUEUE_KEY) || [];
        queue.push({
            ...scoreData,
            timestamp: new Date().toISOString()
        });
        
        StorageManager.setItem(SYNC_QUEUE_KEY, queue);

        if (queue.length >= BATCH_SIZE) {
            return await this.forceSync();
        }
        
        return { status: 'queued', count: queue.length };
    }

    static async forceSync(metadata = {}) {
        const queue = StorageManager.getItem(SYNC_QUEUE_KEY) || [];
        if (queue.length === 0) return { status: 'empty' };

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await axios.post(`${API_URL}/api/scores/sync-batch`, {
                entries: queue,
                ...metadata
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                StorageManager.removeItem(SYNC_QUEUE_KEY);
                return { status: 'synced', count: queue.length, data: response.data };
            }
        } catch (error) {
            console.error('Batch sync failed:', error);
            return { status: 'error', error };
        }
    }

    static getQueueLength() {
        const queue = StorageManager.getItem(SYNC_QUEUE_KEY) || [];
        return queue.length;
    }
}

export default SyncManager;
