// src/models/asset.ts
import mongoose from 'mongoose';
import { AssetType, AssetCategory } from '../types/asset'

const assetSchema = new mongoose.Schema<AssetType>({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: Object.values(AssetCategory) },
  price: { type: Number, required: true, min: 0 }, // price in USD always, then use currency rates to convert
  symbol: { type: String, required: true, uppercase: true }, // e.g., BTC, AAPL, etc.
  image: { type: String },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, immutable: true },
  uniqueKey: { type: String, required: true, unique: true } // e.g., "crypto_BTC"
});

export const Asset = mongoose.model<AssetType>('Asset', assetSchema);
