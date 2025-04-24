// src/models/asset.ts
import mongoose from 'mongoose';
import { AssetType } from '../types/asset'

const assetSchema = new mongoose.Schema<AssetType>({
  name: { type: String, required: true },
  type: { type: String, required: true }, // crypto, stock, real_estate, etc.
  priceUSD: { type: Number, required: true, min: 0 },
  symbol: { type: String, required: true, uppercase: true }, // e.g., BTC, AAPL, etc.
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, immutable: true }
});

export const Asset = mongoose.model<AssetType>('Asset', assetSchema);
