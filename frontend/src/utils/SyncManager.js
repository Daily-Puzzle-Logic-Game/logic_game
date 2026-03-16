import StorageManager from './StorageManager';
import api from '../config/api';

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
            const response = await api.post('/api/scores/sync-batch', {
                entries: queue,
                ...metadata
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
