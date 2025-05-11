// src/types/asset.ts
export enum AssetCategory {
  Crypto = 'crypto',
  Stock = 'stock',
  Etf = 'etf',
  Bond = 'bond',
  Metal = 'metal',
  Cash = 'cash',
  Other = 'other'
}

export const toAssetCategory = (value: string): (AssetCategory | null) => {
  if (Object.values(AssetCategory).includes(value as AssetCategory)) {
    return value as AssetCategory;
  }
  return null;
}

export interface AssetType {
  name: string;
  type: AssetCategory;
  price: number;
  symbol: string;
  image?: string;
  updatedAt?: Date;
  createdAt?: Date;
  uniqueKey: string;
}

export interface AssetSearchResult {
  name: string;
  type: AssetCategory;
  symbol: string;
}