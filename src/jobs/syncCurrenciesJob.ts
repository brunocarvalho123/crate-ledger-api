// src/jobs/syncCurrenciesJob.ts
import { getAllCurrencies, getAvailableCurrencies } from '../services/frankfurter';
import { CurrencyMap } from '../types/currencyMap';
import { syncAssetsWithDb } from '../utils/syncAssets';

export const syncCurrencies = async (availableCurrencies: CurrencyMap) => {
  console.log('🔄 Syncing currencies...');
  try {
    const currencies = await getAllCurrencies(availableCurrencies);
    await syncAssetsWithDb(currencies);
    console.log('✅ Currency sync complete');  
  } catch (error) {
    console.error('❌ Error during Currency sync:', error);
  }
};

export const startSyncCurrenciesJob = async () => {
  const availableCurrencies = await getAvailableCurrencies();
  syncCurrencies(availableCurrencies);
  setInterval(syncCurrencies, 24 * 60 * 60 * 1000);
};
