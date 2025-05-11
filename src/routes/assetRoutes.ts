// src/routes/assetRoutes.ts
import express from 'express';
import { getAsset, getAssets, searchAssets } from '../controllers/assetController';

const router = express.Router();

router.get('/query', getAssets);
router.get('/search', searchAssets);
router.get('/:id', getAsset); 

export default router;