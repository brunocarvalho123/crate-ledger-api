// src/utils/serializeAssets.ts
import { AssetDocument } from "../types/assetDocument";

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