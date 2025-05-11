// tests/utils/fetchAssetFromApi.test.ts
import { fetchAssetFromApi } from '../../src/utils/fetchAssetFromApi';
import { getStock as fmpGetStock } from '../../src/services/fmp';
import { getStock as yfGetStock, getEtf } from '../../src/services/yahooFinance';
import { getCrypto } from '../../src/services/coincap';
import { syncAssetsWithDb } from '../../src/utils/syncAssets';
import { Asset } from '../../src/models/asset';
import { AssetCategory, AssetType } from '../../src/types/asset';

// Mock all dependencies
jest.mock('../../src/services/fmp');
jest.mock('../../src/services/yahooFinance');
jest.mock('../../src/services/coincap');
jest.mock('../../src/utils/syncAssets');
jest.mock('../../src/models/asset');

const mockAsset: AssetType = {
  name: 'Test Asset',
  type: AssetCategory.Stock,
  price: 123,
  symbol: 'TEST',
  createdAt: new Date(),
  updatedAt: new Date(),
  uniqueKey: 'stock_TEST',
};

describe('fetchAssetFromApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and returns stock from FMP', async () => {
    (fmpGetStock as jest.Mock).mockResolvedValue([mockAsset]);
    (Asset.findOne as jest.Mock).mockResolvedValue({ ...mockAsset });

    const result = await fetchAssetFromApi('stock_TEST');

    expect(fmpGetStock).toHaveBeenCalledWith('TEST');
    expect(syncAssetsWithDb).toHaveBeenCalledWith([mockAsset]);
    expect(Asset.findOne).toHaveBeenCalledWith({ uniqueKey: 'stock_TEST' });
    expect(result?.symbol).toBe('TEST');
  });

  it('falls back to Yahoo Finance if FMP fails', async () => {
    (fmpGetStock as jest.Mock).mockRejectedValue(new Error('FMP down'));
    (yfGetStock as jest.Mock).mockResolvedValue([mockAsset]);
    (Asset.findOne as jest.Mock).mockResolvedValue({ ...mockAsset });

    const result = await fetchAssetFromApi('stock_TEST');

    expect(fmpGetStock).toHaveBeenCalled();
    expect(yfGetStock).toHaveBeenCalled();
    expect(result?.symbol).toBe('TEST');
  });

  it('fetches crypto asset', async () => {
    (getCrypto as jest.Mock).mockResolvedValue([mockAsset]);
    (Asset.findOne as jest.Mock).mockResolvedValue({ ...mockAsset });

    const result = await fetchAssetFromApi('crypto_TEST');

    expect(getCrypto).toHaveBeenCalledWith('TEST');
    expect(result?.symbol).toBe('TEST');
  });

  it('returns null if unknown category', async () => {
    const result = await fetchAssetFromApi('Unknown_TEST');
    expect(result).toBeNull();
  });

  it('returns null if API returns no assets', async () => {
    (getCrypto as jest.Mock).mockResolvedValue([]);
    const result = await fetchAssetFromApi('crypto_TEST');
    expect(result).toBeNull();
  });
});
