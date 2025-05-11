// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { AssetCategory, AssetType, toAssetCategory } from '../types/asset';
import { serializeAsset, serializeAssets } from '../utils/serializeAssets'
import { getStock } from '../services/fmp';
import { syncAssetsWithDb } from '../utils/syncAssets';
import { getCrypto } from '../services/coincap';
import { AssetDocument } from '../types/assetDocument';
import { getEtf, getStock as getYFStock } from '../services/yahooFinance';
import { isAssetStale } from '../utils/isAssetStale';

export const getAsset = async (req: Request, res: Response) => {
  console.log("Getting single asset")
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ error: 'ID parameter is required' });
    return;
  }
  console.log(`with key: ${id}`)
  try {
    let asset: AssetDocument | null;
    asset = await Asset.findOne({ uniqueKey: id });

    if (asset === null || isAssetStale(asset)) {
      asset = await fetchAssetFromApi(id);
    }

    console.log(asset)
    res.json(serializeAsset(asset));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

export const getAssets = async (req: Request, res: Response) => {
  console.log("Getting multiple assets");

  const keysParam = req.query.keys as string;
  if (!keysParam) {
    res.status(400).json({ error: 'keys query parameter is required' });
  }

  const uniqueKeys = keysParam.split(',').map(k => k.trim());
  console.log(`Requested keys: ${uniqueKeys}`);

  try {
    // Fetch existing assets
    const foundAssets = await Asset.find({ uniqueKey: { $in: uniqueKeys } });
    const foundMap = new Map(foundAssets.map(a => [a.uniqueKey, a]));

    const finalAssets: AssetDocument[] = [];

    for (const key of uniqueKeys) {
      let asset:(AssetDocument | null) = foundMap.get(key) || null;

      if (asset === null || isAssetStale(asset)) { 
        console.log(`Fetching fresh asset for: ${key}`);
        try {
          asset = await fetchAssetFromApi(key);
        } catch (err) {
          console.warn(`Failed to fetch asset for key ${key}:`, err);
        }
      }
      if (asset) {
        finalAssets.push(asset);
      }
    }

    res.json(serializeAssets(finalAssets));
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

const fetchAssetFromApi = async (key: string): Promise<AssetDocument | null> => {
  // Asset not found in database check type and request data from apropriate API
  let asset: AssetDocument | null = null;
  const type: AssetCategory | null = toAssetCategory(key.split('_')[0]);
  const symbol = key.split('_')[1];
  let apiCallResult: AssetType[] | undefined;
  if (type && symbol) {
    switch (type) {
      case AssetCategory.Stock:
        try {
          apiCallResult = await getStock(symbol);
        } catch (error) {
          console.error(error);
          apiCallResult = await getYFStock(symbol);
        }
        break;
      case AssetCategory.Etf:
        apiCallResult = await getEtf(symbol);
        break;
      case AssetCategory.Crypto:
        apiCallResult = await getCrypto(symbol);
        break;
      default:
        throw new Error(`No individual fetch for ${type}`);
    }
    if (apiCallResult !== undefined && apiCallResult.length > 0) {
      await syncAssetsWithDb(apiCallResult);
      asset = await Asset.findOne({ uniqueKey: key });
    }
  }
  return asset;
}