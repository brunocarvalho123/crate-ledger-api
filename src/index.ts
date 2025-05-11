// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './utils/logger';
import loggerMiddleware from './middleware/loggerMiddleware';
import { apiLimiter } from './middleware/apiLimiter';
import assetRoutes from './routes/assetRoutes';
import { Asset } from './models/asset';
import { startSyncCryptoAssetsJob } from './jobs/syncCryptoAssetsJob';
import { startSyncCurrenciesJob } from './jobs/syncCurrenciesJob';
import { startSyncMetalAssetsJob } from './jobs/syncMetalAssetsJob';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(apiLimiter);
app.use(loggerMiddleware);
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