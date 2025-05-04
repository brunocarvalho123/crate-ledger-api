// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { AssetType } from '../types/asset';
import { serializeAsset, serializeAssets } from '../utils/serializeAssets'

export const getAsset = async (req: Request, res: Response) => {
  console.log("Getting single asset")
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ error: 'ID parameter is required' });
    return;
  }
  console.log(`with key: ${id}`)
  try {
    const asset = await Asset.findOne({ uniqueKey: id });
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