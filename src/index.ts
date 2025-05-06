// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import assetRoutes from './routes/assetRoutes';
import { Asset } from './models/asset';
import { getAllAssetsInfo as geckoAssetsInfo } from './api-managers/coingecko';
import { syncAssetsWithDb } from './utils/syncAssets';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('MongoDB connected')
    try {
      await Asset.init()
    } catch (error) {
      console.error('Failed to initialize indexes:', error);
    }

    const fetchCryptoAssets = true;
    if (fetchCryptoAssets) {
      const geckoAssets = await geckoAssetsInfo();
      await syncAssetsWithDb(geckoAssets);
    }
  })
  .catch(err => console.error('MongoDB error:', err));

// Routes
app.use('/assets', assetRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
