// src/jobs/syncCurrenciesJob.ts
import { getAllCurrencies, getAvailableCurrencies } from '../services/frankfurter';
import { CurrencyMap } from '../types/currencyMap';
import { UnexpectedApiData } from '../utils/errors/serviceErrors';
import logger from '../utils/logger';
import { syncAssetsWithDb } from '../utils/syncAssets';

export const syncCurrencies = async (availableCurrencies: CurrencyMap) => {
  logger.info('🔄 Syncing currencies...');
  try {
    const currencies = await getAllCurrencies(availableCurrencies);
    await syncAssetsWithDb(currencies);
    logger.info('✅ Currency sync complete');  
  } catch (error) {
    if (error instanceof UnexpectedApiData) {
      logger.error(`Unexpected Data response from API: ${error.message}`, error.results);
    } else {
      logger.error('❌ Error during Currency sync:', error);
    }
  }
};

export const startSyncCurrenciesJob = async () => {
  const availableCurrencies = await getAvailableCurrencies();
  syncCurrencies(availableCurrencies);
  setInterval(syncCurrencies, 24 * 60 * 60 * 1000);
};
