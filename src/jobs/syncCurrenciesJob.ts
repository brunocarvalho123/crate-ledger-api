// src/jobs/syncCurrenciesJob.ts
import { getAllCurrencies, getAvailableCurrencies } from '../api-managers/frankfurter';
import { syncAssetsWithDb } from '../utils/syncAssets';

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const syncCurrenciesJob = async () => {
  
  const syncCurrencies = async (availableCurrencies: any) => {
    try {
      console.log('🔄 Syncing currencies...');
      const currencies = await getAllCurrencies(availableCurrencies);
      await syncAssetsWithDb(currencies);
      console.log('✅ Currency sync complete');
    } catch (err) {
      console.error('❌ Error during Currency sync:', err);
    }
  };

  // Run immediately on start
  const availableCurrencies = await getAvailableCurrencies();
  syncCurrencies(availableCurrencies);

  // Schedule repeated runs
  setInterval(syncCurrencies, SYNC_INTERVAL_MS);
};
