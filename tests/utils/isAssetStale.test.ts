// tests/utils/isAssetStale.test.ts
import { isAssetStale } from '../../src/utils/isAssetStale';
import { AssetDocument } from "../../src/types/assetDocument";
import { AssetCategory } from '../../src/types/asset';

describe('isAssetStale', () => {
    const mockAssetDocuments: AssetDocument[] = [{
      name: 'Bitcoin',
      type: AssetCategory.Crypto,
      symbol: 'BTC',
      price: 10000,
      image: '',
      uniqueKey: 'crypto_BTC',
      createdAt: new Date(),
      updatedAt: new Date((new Date).getTime() - 6 * 60 * 1000), // 6 minutes old data
      _id: 'mockid1'
    } as AssetDocument,
    {
      name: 'Apple Inc.',
      type: AssetCategory.Stock,
      symbol: 'AAPL',
      price: 200,
      image: '',
      uniqueKey: 'stock_AAPL',
      createdAt: new Date(),
      updatedAt: new Date((new Date).getTime() - 28 * 60 * 1000), // 28 minutes old data
      _id: 'mockid2'
    } as AssetDocument,
    {
      name: 'Nvidia Corp.',
      type: AssetCategory.Stock,
      symbol: 'NVDA',
      price: 150,
      image: '',
      uniqueKey: 'stock_NVDA',
      createdAt: new Date(),
      updatedAt: undefined,
      _id: 'mockid2'
    } as AssetDocument
  ];

  it('checks if stale assets are stale', () => {
    const result = isAssetStale(mockAssetDocuments[0]);
    expect(result).toBe(true);
  });

  it('checks if not stale assets is not stale', () => {
    const result = isAssetStale(mockAssetDocuments[1]);
    expect(result).toBe(false);
  });

  it('deal with bad data', () => {
    expect(() => isAssetStale(mockAssetDocuments[2])).toThrow('Cant check for stale: asset has invalid updatedAt');
  });
});