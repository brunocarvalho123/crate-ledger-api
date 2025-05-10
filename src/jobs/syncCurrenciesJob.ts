// src/jobs/syncCurrenciesJob.ts
import { getAllCurrencies, getAvailableCurrencies } from '../services/frankfurter';
import { syncAssetsWithDb } from '../utils/syncAssets';

const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
