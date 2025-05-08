// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { AssetCategory, AssetType, toAssetCategory } from '../types/asset';
import { serializeAsset, serializeAssets } from '../utils/serializeAssets'
import { getStock } from '../api-managers/fmp';
import { syncAssetsWithDb } from '../utils/syncAssets';
import { getCrypto } from '../api-managers/coincap';
import { AssetDocument } from '../types/assetDocument';

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

const isAssetStale = (asset: AssetDocument): Boolean => {
  if (asset.updatedAt) {
    const now = new Date();
    const assetUpdatedAt = new Date(asset.updatedAt);

    let staleTime = 10 * 60000 // 10min default

    switch (asset.type) {
      case AssetCategory.Stock:
        staleTime = 30 * 60000 // 30min
        break;
      case AssetCategory.Etf:
        staleTime = 30 * 60000 // 30min
        break;
      case AssetCategory.Crypto:
        staleTime = 5 * 60000 // 5min
        break;
      case AssetCategory.Bond:
        staleTime = 60 * 60000 // 1hr
        break;
      case AssetCategory.Metal:
        staleTime = 2 * 60 * 60000 // 2hr
        break;
      case AssetCategory.Cash:
        staleTime = Infinity // None
        break;
      default:
        throw new Error("Invalid type");
    }

    if ((now.getTime() - assetUpdatedAt.getTime()) > staleTime) {
      console.log(`${asset.symbol} is stale...`)
      return true
    }
  }
  return false;
}

const fetchAssetFromApi = async (key: string): Promise<AssetDocument | null> => {
  // Asset not found in database check type and request data from apropriate API
  let asset: AssetDocument | null = null;
  const type: AssetCategory | null = toAssetCategory(key.split('_')[0]);
  const symbol = key.split('_')[1];
  let apiCallResult: AssetType[] | undefined;
  if (type && symbol) {
    switch (type) {
      case AssetCategory.Stock:
        apiCallResult = await getStock(symbol);
        break;
      case AssetCategory.Etf:
        break;
      case AssetCategory.Crypto:
        apiCallResult = await getCrypto(symbol);
        break;
      case AssetCategory.Bond:
        break;
      case AssetCategory.Metal:
        break;
      case AssetCategory.Cash:
        break;
      default:
        throw new Error("Invalid type");
    }
    if (apiCallResult !== undefined) {
      await syncAssetsWithDb(apiCallResult);
      asset = await Asset.findOne({ uniqueKey: key });
    }
  }
  return asset;
}