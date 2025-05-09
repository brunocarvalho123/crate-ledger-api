// src/index.ts
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import assetRoutes from './routes/assetRoutes';
import { Asset } from './models/asset';
import { syncCryptoAssetsJob } from './jobs/syncCryptoAssetsJob';
import { syncCurrenciesJob } from './jobs/syncCurrenciesJob';
import { getAsset } from './api-managers/yahooFinance';
import { syncMetalAssetsJob } from './jobs/syncMetalAssetsJob';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later.'
  }
});
app.use(apiLimiter);

app.use('/assets', assetRoutes);

mongoose.connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log('✅ MongoDB connected');

    try {
      await Asset.init();
    } catch (error) {
      console.error('❌ Failed to initialize indexes:', error);
    }

    // getAsset('CNDX.AS');
    // syncCryptoAssetsJob();
    // syncCurrenciesJob();
    // syncMetalAssetsJob();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });