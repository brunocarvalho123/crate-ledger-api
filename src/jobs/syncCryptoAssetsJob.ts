// src/jobs/syncCryptoAssetsJob.ts
import { getAllAssetsInfo } from '../services/coingecko';
import { syncAssetsWithDb } from '../utils/syncAssets';

export const syncCryptoAssets = async () => {
  console.log('🔄 Syncing crypto assets...');
  const geckoAssets = await getAllAssetsInfo();
  await syncAssetsWithDb(geckoAssets);
  console.log('✅ Asset sync complete');
};

export const startSyncCryptoAssetsJob = () => {
  syncCryptoAssets();
  setInterval(syncCryptoAssets, 5 * 60 * 1000);
};
