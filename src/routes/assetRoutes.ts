// src/routes/assetRoutes.ts
import express from 'express';
import { getAllAssets, createAsset } from '../controllers/assetController';

const router = express.Router();

router.get('/', getAllAssets);
router.post('/', createAsset);

export default router;