// src/jobs/syncMetalAssetsJob.ts
import { getAllMetals } from '../services/metalprices';
import { UnexpectedApiData } from '../utils/errors/serviceErrors';
import logger from '../utils/logger';
import { syncAssetsWithDb } from '../utils/syncAssets';

export const syncMetalAssets = async () => {
  logger.info('🔄 Syncing metal assets...');
  try {
    const metalAssets = await getAllMetals();
    await syncAssetsWithDb(metalAssets);
    logger.info('✅ Metal assets sync complete');  
  } catch (error) {
    if (error instanceof UnexpectedApiData) {
      logger.error(`Unexpected Data response from API: ${error.message}`, error.results);
    } else {
      logger.error('❌ Error during Metal assets sync:', error);
    }
  }
};

export const startSyncMetalAssetsJob = () => {
  syncMetalAssets();
  setInterval(syncMetalAssets, 24 * 60 * 60 * 1000);
};