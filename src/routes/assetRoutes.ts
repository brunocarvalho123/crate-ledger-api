// src/routes/assetRoutes.ts
import express from 'express';
import { getAllAssets, getAssetBySymbol, getAssetsBySymbol } from '../controllers/assetController';

const router = express.Router();

router.get('/', getAllAssets);
router.get('/query', getAssetsBySymbol);
router.get('/:id', getAssetBySymbol); 

export default router;