// src/types/asset.ts
export interface AssetType {
  name: string;
  type: string;
  price: number;
  symbol: string;
  image?: string;
  updatedAt?: Date;
  createdAt?: Date;
}
  