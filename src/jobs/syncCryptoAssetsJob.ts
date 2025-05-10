// src/jobs/syncCryptoAssetsJob.ts
import { getAllAssetsInfo } from '../services/coingecko';
import { syncAssetsWithDb } from '../utils/syncAssets';

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const syncCryptoAssetsJob = () => {
  const syncAssets = async () => {
    try {
      console.log('🔄 Syncing crypto assets...');
      const geckoAssets = await getAllAssetsInfo();
      await syncAssetsWithDb(geckoAssets);
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
