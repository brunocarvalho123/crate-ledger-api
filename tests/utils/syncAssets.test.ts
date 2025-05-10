// tests/utils/syncAssets.test.ts
import { syncAssetsWithDb } from '../../src/utils/syncAssets';
import { Asset } from '../../src/models/asset';
import { AssetType, AssetCategory } from '../../src/types/asset';

jest.mock('../../src/models/asset', () => ({
  Asset: {
    bulkWrite: jest.fn()
  }
}));

describe('syncAssetsWithDb', () => {
  const mockAssets: AssetType[] = [
    {
      name: 'Bitcoin',
      type: AssetCategory.Crypto,
      price: 50000,
      symbol: 'btc',
      image: 'https://image.url/btc.png',
      uniqueKey: 'crypto_BTC'
    },
    {
      name: 'Ethereum',
      type: AssetCategory.Crypto,
      price: 3000,
      symbol: 'eth',
      image: 'https://image.url/eth.png',
      uniqueKey: 'crypto_ETH'
    }
  ];

  it('calls Asset.bulkWrite with correct operations', async () => {
    const mockResult = {
      matchedCount: 2,
      upsertedCount: 0,
      modifiedCount: 1
    };
    (Asset.bulkWrite as jest.Mock).mockResolvedValue(mockResult);

    const result = await syncAssetsWithDb(mockAssets);

    expect(Asset.bulkWrite).toHaveBeenCalledTimes(1);

    const bulkOps = (Asset.bulkWrite as jest.Mock).mock.calls[0][0];

    expect(bulkOps).toHaveLength(2);
    expect(bulkOps[0].updateOne.filter.uniqueKey).toBe('crypto_BTC');
    expect(bulkOps[1].updateOne.filter.uniqueKey).toBe('crypto_ETH');
    expect(result).toEqual(mockResult);
  });

  it('throws an error if bulkWrite fails', async () => {
    (Asset.bulkWrite as jest.Mock).mockRejectedValue(new Error('DB error'));

    await expect(syncAssetsWithDb(mockAssets)).rejects.toThrow('DB error');
  });
});
