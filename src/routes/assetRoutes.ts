// src/routes/assetRoutes.ts
import express from 'express';
import { getAllAssets, createAsset, getAssetBySymbol, getAssetsBySymbol } from '../controllers/assetController';

const router = express.Router();

router.get('/', getAllAssets);
router.post('/', createAsset);
router.get('/query', getAssetsBySymbol);
router.get('/:id', getAssetBySymbol); 

export default router;