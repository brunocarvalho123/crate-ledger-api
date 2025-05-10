// src/jobs/syncMetalAssetsJob.ts
import { getAllMetals } from '../services/metalprices';
import { syncAssetsWithDb } from '../utils/syncAssets';

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const syncMetalAssetsJob = () => {
  const syncAssets = async () => {
    try {
      console.log('🔄 Syncing metal assets...');
      const metalAssets = await getAllMetals();
      await syncAssetsWithDb(metalAssets);
      console.log('✅ Asset sync complete');
    } catch (err) {
      console.error('❌ Error during asset sync:', err);
    }
  };

  // Run immediately on start
  syncAssets();

  // Schedule repeated runs
  setInterval(syncAssets, SYNC_INTERVAL_MS);
};
