// src/jobs/syncCryptoAssetsJob.ts
import { getAllAssetsInfo } from '../services/coingecko';
import { syncAssetsWithDb } from '../utils/syncAssets';

export const syncCryptoAssets = async () => {
  console.log('🔄 Syncing crypto assets...');
  try {
    const geckoAssets = await getAllAssetsInfo();
    await syncAssetsWithDb(geckoAssets);
    console.log('✅ Crypto assets sync complete');  
  } catch (error) {
    console.error('❌ Error during Crypto assets sync:', error);
  }
};

export const startSyncCryptoAssetsJob = () => {
  syncCryptoAssets();
  setInterval(syncCryptoAssets, 5 * 60 * 1000);
};
