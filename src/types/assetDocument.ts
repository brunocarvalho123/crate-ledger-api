// src/types/assetDocument.ts
import { Document } from 'mongoose';
import { AssetType } from './asset';

export type AssetDocument = Document & AssetType;
