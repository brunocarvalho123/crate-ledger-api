// src/index.ts
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './utils/logger';
import assetRoutes from './routes/assetRoutes';
import { Asset } from './models/asset';
import { startSyncCryptoAssetsJob } from './jobs/syncCryptoAssetsJob';
import { startSyncCurrenciesJob } from './jobs/syncCurrenciesJob';
import { startSyncMetalAssetsJob } from './jobs/syncMetalAssetsJob';

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
    logger.info('✅ MongoDB connected');

    try {
      await Asset.init();
    } catch (error) {
      logger.error('❌ Failed to initialize indexes:', error);
    }

    // startSyncCryptoAssetsJob();
    // startSyncMetalAssetsJob();
    // startSyncCurrenciesJob();

    app.listen(port, () => {
      logger.info(`🚀 Server running on port ${port}`);
    });
  })
  .catch(error => {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });