// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { AssetType } from '../types/asset';

export const getAllAssets = async (req: Request, res: Response) => {
  try {
    const assets = await Asset.find();
    const serializedAssets = assets.map(asset => ({
      name: asset.name,
      type: asset.type,
      symbol: asset.symbol,
      price: asset.price
    }));
    res.json(serializedAssets);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const newAsset: AssetType = req.body;
    const asset = new Asset(newAsset);
    await asset.save();
    res.status(201).json(asset);
  } catch (err) {
    res.status(400).json({ message: 'Invalid asset data', error: err });
  }
};
