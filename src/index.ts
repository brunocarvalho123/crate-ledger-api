// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import assetRoutes from './routes/assetRoutes';
import { Asset } from './models/asset';
import { syncCryptoAssetsJob } from './jobs/syncCryptoAssetsJob';
import { syncCurrenciesJob } from './jobs/syncCurrenciesJob';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/assets', assetRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('✅ MongoDB connected');

    try {
      await Asset.init();
    } catch (error) {
      console.error('❌ Failed to initialize indexes:', error);
    }

    syncCryptoAssetsJob();
    syncCurrenciesJob();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });