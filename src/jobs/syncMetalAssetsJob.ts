// src/jobs/syncMetalAssetsJob.ts
import { getAllMetals } from '../services/metalprices';
import { syncAssetsWithDb } from '../utils/syncAssets';

export const syncMetalAssets = async () => {
  console.log('🔄 Syncing metal assets...');
  try {
    const metalAssets = await getAllMetals();
    await syncAssetsWithDb(metalAssets);
    console.log('✅ Metal assets sync complete');  
  } catch (error) {
    console.error('❌ Error during Metal assets sync:', error);
  }
};

export const startSyncMetalAssetsJob = () => {
  syncMetalAssets();
  setInterval(syncMetalAssets, 24 * 60 * 60 * 1000);
};