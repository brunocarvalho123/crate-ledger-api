// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { serializeAsset, serializeAssets } from '../utils/serializeAssets'
import { AssetDocument } from '../types/assetDocument';
import { isAssetStale } from '../utils/isAssetStale';
import { fetchAssetFromApi } from '../utils/fetchAssetFromApi';
import { searchYahoo } from '../services/yahooFinance';
import { SearchQueryTooShort, UnexpectedApiData } from '../utils/errors/serviceErrors';
import logger from '../utils/logger';
import { AssetCategory, AssetSearchResult, toAssetCategory } from '../types/asset';
import { searchDb } from '../utils/db/search';

export const getAsset = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ error: 'ID parameter is required' });
    return;
  }
  try {
    let asset: AssetDocument | null;
    asset = await Asset.findOne({ uniqueKey: id });

    if (asset === null || isAssetStale(asset)) {
      asset = await fetchAssetFromApi(id);
    }
    res.json(serializeAsset(asset));
    return;
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assets', error: error });
    return;
  }
};

export const getAssets = async (req: Request, res: Response) => {
  const keysParam = req.query?.keys as string;
  if (!keysParam) {
    res.status(400).json({ error: 'keys query parameter is required' });
    return;
  }
  const uniqueKeys = keysParam.split(',').map(k => k.trim());
  try {
    // Fetch existing assets
    const foundAssets = await Asset.find({ uniqueKey: { $in: uniqueKeys } });
    const foundMap = new Map(foundAssets.map(a => [a.uniqueKey, a]));

    const finalAssets: AssetDocument[] = [];

    for (const key of uniqueKeys) {
      let asset:(AssetDocument | null) = foundMap.get(key) || null;

      if (asset === null || isAssetStale(asset)) { 
        try {
          asset = await fetchAssetFromApi(key);
        } catch (error) {
          logger.warn(`Failed to fetch asset for key ${key}:`, error);
        }
      }
      if (asset) {
        finalAssets.push(asset);
      }
    }

    res.json(serializeAssets(finalAssets));
    return;
  } catch (error) {
    logger.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error fetching assets', error: error });
    return;
  }
};

export const searchAssets = async (req: Request, res: Response) => {
  const searchParam = req.query?.query as string;
  const typeParam = toAssetCategory(req.query?.type as string);
  if (!searchParam) {
    res.status(400).json({ error: 'Search query parameter is required' });
    return;
  }
  try {
    let results: AssetSearchResult[] = [];
    if (typeParam) {
      if (typeParam == AssetCategory.Etf || typeParam == AssetCategory.Stock) {
        results = await searchYahoo(searchParam);
      }
      const dbResults = await searchDb(searchParam, typeParam);
      results = [...results, ...dbResults];
    } else {
      const dbResults = await searchDb(searchParam);
      const yahooResults = await searchYahoo(searchParam);
      results = [...dbResults, ...yahooResults];
    }
    const uniqueStringifiedArray = [...new Set(results.map(item => JSON.stringify(item)))];
    const uniqueResults = uniqueStringifiedArray.map(item => JSON.parse(item));
    
    res.json(uniqueResults);
    return;
  } catch (error) {
    if (error instanceof UnexpectedApiData) {
      logger.error(`Error from API: ${error.message}`, error.results);
    } else if (error instanceof SearchQueryTooShort) {
      logger.error('Search query too short:', error);
    } else {
      logger.error('An unexpected error occurred:', error);
    }
    res.status(500).json({ message: 'Error searching assets', error: error });
    return;
  }
}