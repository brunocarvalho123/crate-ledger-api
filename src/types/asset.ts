import { ImageType } from "./image";

// src/types/asset.ts
export interface AssetType {
  name: string;
  type: string;
  price: number;
  symbol: string;
  image?: ImageType;
  updatedAt?: Date;
  createdAt?: Date;
}
  