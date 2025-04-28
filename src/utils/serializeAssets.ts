// src/utils/serializeAssets.ts
import { Document } from 'mongoose';
import { AssetType } from '../types/asset';

type AssetDocument = Document & AssetType;

export const serializeAssets = (assets: AssetDocument[]) => {
  return assets.map(asset => ({
    name: asset.name,
    type: asset.type,
    symbol: asset.symbol,
    price: asset.price,
    thumbURL: asset.image?.thumb,
    smallURL: asset.image?.small,
    largeURL: asset.image?.large
  }));
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
    thumbURL: asset.image?.thumb,
    smallURL: asset.image?.small,
    largeURL: asset.image?.large
  };
}