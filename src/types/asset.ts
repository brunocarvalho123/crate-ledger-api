// src/types/asset.ts
export interface AssetType {
  name: string;
  type: string;
  priceUSD: number;
  symbol: string;
  updatedAt?: Date;
  createdAt?: Date;
}
  