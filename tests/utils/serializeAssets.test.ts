// tests/utils/serializeAssets.test.ts
import { serializeAssets, serializeAsset } from '../../src/utils/serializeAssets';
import { AssetDocument } from "../../src/types/assetDocument";
import { AssetCategory } from '../../src/types/asset';

describe('serializeAssets', () => {
  const mockAssetDocuments: AssetDocument[] = [{
      name: 'Bitcoin',
      type: AssetCategory.Crypto,
      symbol: 'BTC',
      price: 10000,
      image: '',
      uniqueKey: 'crypto_BTC',
      createdAt: new Date(),
      updatedAt: new Date(),
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
      updatedAt: new Date(),
      _id: 'mockid2'
    } as AssetDocument
  ]

  it('serializes valid asset documents', () => {
    const mockResult = [{
        name: 'Bitcoin',
        type: 'crypto',
        symbol: 'BTC',
        price: 10000,
        image: ''
      },
      {
        name: 'Apple Inc.',
        type: 'stock',
        symbol: 'AAPL',
        price: 200,
        image: ''
      }
    ];
    const result1 = serializeAssets(mockAssetDocuments);
    expect(result1).toEqual(mockResult);
    const result2 = serializeAsset(mockAssetDocuments[1]);
    expect(result2).toEqual(mockResult[1]);
  });

  it('serializes empty documents', () => {
    const result = serializeAssets([]);
    expect(result).toEqual([]);
  });

  it('serializes null document', () => {
    const result1 = serializeAsset(null);
    expect(result1).toEqual({});
  });
});