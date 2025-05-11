// src/utils/db/search.ts
import { Asset } from '../../models/asset';
import { AssetSearchResult, AssetCategory } from '../../types/asset';
import { AssetDocument } from '../../types/assetDocument';
import { SearchQueryTooShort } from '../errors/serviceErrors';
import logger from '../logger';

export const searchDb = async (query: string, type?: AssetCategory): Promise<AssetSearchResult[]> => {
  if (query.length < 3) {
    throw new SearchQueryTooShort('Query string should be at least 3 characters long');
  }
  let searchQuery: any = { $text: { $search: query } };
  if (type) {
    searchQuery.type = type;
  }
  const assets = await Asset.find(
    searchQuery,
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  const results: AssetSearchResult[] = assets.map((asset: AssetDocument) => {
    return {
      name: asset.name,
      type: asset.type,
      symbol: asset.symbol
    }
  })

  logger.info(`searching db with ${query} and ${type}. Results: ${assets}`);
  return results;
};