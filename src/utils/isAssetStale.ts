// src/utils/isAssetStale.ts
import { AssetCategory } from "../types/asset";
import { AssetDocument } from "../types/assetDocument";

export const isAssetStale = (asset: AssetDocument): boolean => {
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
        staleTime = Infinity // None
        break;
      case AssetCategory.Metal:
        staleTime = Infinity // None
        break;
      case AssetCategory.Cash:
        staleTime = Infinity // None
        break;
      default:
        throw new Error("Invalid type");
    }

    if ((now.getTime() - assetUpdatedAt.getTime()) > staleTime) {
      return true;
    }  else {
      return false;
    }
  }
  throw new Error('Cant check for stale: asset has invalid updatedAt');
}