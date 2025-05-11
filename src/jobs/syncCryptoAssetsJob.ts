// src/jobs/syncCryptoAssetsJob.ts
import { getAllAssetsInfo } from '../services/coingecko';
import { UnexpectedApiData } from '../utils/errors/serviceErrors';
import logger from '../utils/logger';
import { syncAssetsWithDb } from '../utils/db/syncAssets';

export const syncCryptoAssets = async () => {
  logger.info('🔄 Syncing crypto assets...');
  try {
    const geckoAssets = await getAllAssetsInfo();
    await syncAssetsWithDb(geckoAssets);
    logger.info('✅ Crypto assets sync complete');  
  } catch (error) {
    if (error instanceof UnexpectedApiData) {
      logger.error(`Unexpected Data response from API: ${error.message}`, error.results);
    } else {
      logger.error('❌ Error during Crypto assets sync:', error);
    }
  }
};

export const startSyncCryptoAssetsJob = () => {
  syncCryptoAssets();
  setInterval(syncCryptoAssets, 5 * 60 * 1000);
};
