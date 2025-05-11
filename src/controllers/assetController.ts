// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { serializeAsset, serializeAssets } from '../utils/serializeAssets'
import { AssetDocument } from '../types/assetDocument';
import { isAssetStale } from '../utils/isAssetStale';
import { fetchAssetFromApi } from '../utils/fetchAssetFromApi';
import { searchYahoo } from '../services/yahooFinance';

export const getAsset = async (req: Request, res: Response) => {
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
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
    return;
  }
};

export const getAssets = async (req: Request, res: Response) => {
  const keysParam = req.query?.keys as string;
  console.log(keysParam);
  
  if (!keysParam) {
    res.status(400).json({ error: 'keys query parameter is required' });
    return;
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
    return;
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Error fetching assets', error: err });
    return;
  }
};

export const searchAssets = async (req: Request, res: Response) => {
  const searchParam = req.query?.query as string;
  if (!searchParam) {
    res.status(400).json({ error: 'Search query parameter is required' });
    return;
  }
  try {
    const results = await searchYahoo(searchParam);  
    res.json(results);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error searching assets', error: err });
    return;
  }
}