// src/utils/serializeAssets.ts
import { Document } from 'mongoose';
import { AssetType } from '../types/asset';

type AssetDocument = Document & AssetType;

export const serializeAssets = (assets: AssetDocument[]) => {
  return assets.map(asset => serializeAsset(asset));
}

export const serializeAsset = (asset: AssetDocument | null) => {
  if (asset === null) {
    return {};
  }

  return {
    name: asset.name,
    type: asset.type,
    symbol: asset.symbol,
    price: asset.price,
    image: asset.image
  };
}