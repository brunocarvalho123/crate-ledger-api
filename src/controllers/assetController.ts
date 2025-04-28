// src/controllers/assetController.ts
import { Request, Response } from 'express';
import { Asset } from '../models/asset';
import { AssetType } from '../types/asset';
import { serializeAsset, serializeAssets } from '../utils/serializeAssets'

export const getAllAssets = async (_: Request, res: Response) => {
  try {
    console.log("Getting all assets")
    const assets = await Asset.find();
    console.log(assets)
    res.json(serializeAssets(assets));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

export const getAssetBySymbol = async (req: Request, res: Response) => {
  console.log("Getting single asset")
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ error: 'ID parameter is required' });
    return;
  }
  console.log(`with symbol: %{id}`)
  try {
    const asset = await Asset.findOne({ symbol: "id" });
    console.log(asset)
    res.json(serializeAsset(asset));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets', error: err });
  }
};

export const getAssetsBySymbol = async (req: Request, res: Response) => {
  console.log("Getting multiple assets")
  const symbols = req.query.symbol as string;
  if (!symbols) {
    res.status(400).json({ error: 'Symbol query parameter is required' });
    return;
  }
  console.log(`with symbols: %{symbols}`)
  const symbolArray = symbols.split(',');
  try {
    const assets = await Asset.find({ symbol: { $in: symbolArray } });
    console.log(assets)
    res.json(serializeAssets(assets));
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
