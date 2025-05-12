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

  const textQuery: any = { $text: { $search: query } };
  const regexQuery: any = {
    $or: [
      { name: new RegExp(query, 'i') },
      { symbol: new RegExp(query, 'i') }
    ]
  };
  if (type) {
    textQuery.type = type;
    regexQuery.type = type;
  }

  const [textResults, regexResults] = await Promise.all([
    Asset.find(textQuery, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } }),
    Asset.find(regexQuery).limit(20) // limit to avoid huge result set
  ]);

  const combined = [...textResults, ...regexResults];

  const unique = new Map<string, AssetDocument>();
  for (const asset of combined) {
    unique.set(asset._id.toString(), asset);
  }

  // Exact matches should come first!
  const sorted = Array.from(unique.values()).sort((a, b) => {
    const aExact = a.symbol.toLowerCase() === query.toLowerCase();
    const bExact = b.symbol.toLowerCase() === query.toLowerCase();
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  return sorted.map((asset) => ({
    name: asset.name,
    type: asset.type,
    symbol: asset.symbol
  }));
};