// src/utils/fetchAssetFromApi.ts
import { Asset } from "../models/asset";
import { getCrypto } from "../services/coincap";
import { getStock } from "../services/fmp";
import { getEtf, getStock as getYFStock } from "../services/yahooFinance";
import { AssetCategory, toAssetCategory, AssetType } from "../types/asset";
import { AssetDocument } from "../types/assetDocument";
import logger from "./logger";
import { syncAssetsWithDb } from "./syncAssets";

export const fetchAssetFromApi = async (key: string): Promise<AssetDocument | null> => {
  // Asset not found in database check type and request data from apropriate API
  let asset: AssetDocument | null = null;
  const type: AssetCategory | null = toAssetCategory(key.split('_')[0]);
  const symbol = key.split('_')[1];
  let apiCallResult: AssetType[] | undefined;
  if (type && symbol) {
    switch (type) {
      case AssetCategory.Stock:
        try {
          apiCallResult = await getStock(symbol);
        } catch (error) {
          logger.error('Error calling FMP stock API, trying with yahoo...', error);
          apiCallResult = await getYFStock(symbol);
        }
        break;
      case AssetCategory.Etf:
        apiCallResult = await getEtf(symbol);
        break;
      case AssetCategory.Crypto:
        apiCallResult = await getCrypto(symbol);
        break;
      default:
        throw new Error(`No individual fetch for ${type}`);
    }
    if (apiCallResult !== undefined && apiCallResult.length > 0) {
      await syncAssetsWithDb(apiCallResult);
      asset = await Asset.findOne({ uniqueKey: key });
    }
  }
  return asset;
}