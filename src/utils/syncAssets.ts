import { Asset } from '../models/asset';
import { AssetType } from '../types/asset';

export const syncAssetsWithDb = async (assets: AssetType[]) => {
  const now = new Date();

  const bulkOps = assets.map(asset => {
    const uniqueKey = `${asset.type}_${asset.symbol.toUpperCase()}`;

    return {
      updateOne: {
        filter: { uniqueKey },
        update: {
          $set: {
            name: asset.name,
            type: asset.type,
            price: asset.price,
            symbol: asset.symbol.toUpperCase(),
            image: asset.image,
            updatedAt: now,
            uniqueKey: asset.uniqueKey || uniqueKey
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        upsert: true
      }
    };
  });

  try {
    const result = await Asset.bulkWrite(bulkOps);
    console.log(`syncAssetsWithDb: Matched ${result.matchedCount}, Upserted ${result.upsertedCount}, Modified ${result.modifiedCount}`);
    return result;
  } catch (err) {
    console.error('syncAssetsWithDb: Bulk operation failed:', err);
    throw err;
  }
};