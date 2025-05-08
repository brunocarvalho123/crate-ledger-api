// src/api-managers/yahooFinance.ts
import { AssetCategory, AssetType } from '../types/asset';
import yahooFinance from 'yahoo-finance2';

export const getAsset = async (asset: string) => {
    const results = await yahooFinance.quote(asset);
    console.log(results);
}