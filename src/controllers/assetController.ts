// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { AssetType } from '../types/asset';
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
    if (asset === null) {
      asset = await fetchAssetFromApi(id);
    }
    console.log(asset)
    res.json(serializeAsset(asset));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

export const getAssets = async (req: Request, res: Response) => {
  console.log("Getting multiple assets")
  const keys = req.query.keys as string;
  if (!keys) {
    res.status(400).json({ error: 'Symbol query parameter is required' });
    return;
  }
  console.log(`with keys: ${keys}`)
  const symbolArray = keys.split(',');
  try {
    const assets = await Asset.find({ uniqueKey: { $in: symbolArray } });
    console.log(assets)
    res.json(serializeAssets(assets));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

const fetchAssetFromApi = async (key: String): Promise<AssetDocument | null> => {
  // Asset not found in database check type and request data from apropriate API
  let asset: AssetDocument | null = null;
  const type = key.split('_')[0];
  const symbol = key.split('_')[1];
  let apiCallResult: AssetType[] | undefined;
  if (type && symbol) {
    switch (type) {
      case 'stock':
        apiCallResult = await getStock(symbol);
        break;
      case 'etf':
        break;
      case 'crypto':
        apiCallResult = await getCrypto(symbol);
        break;
      case 'bond':
        break;
      case 'metal':
        break;
      case 'cash':
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