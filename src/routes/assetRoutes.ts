// src/routes/assetRoutes.ts
import express from 'express';
import { getAsset, getAssets } from '../controllers/assetController';

const router = express.Router();

router.get('/query', getAssets);
router.get('/:id', getAsset); 

export default router;