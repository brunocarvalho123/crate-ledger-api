// tests/controllers/assetController.test.ts
import { getAsset, getAssets, searchAssets } from '../../src/controllers/assetController';
import { Asset } from '../../src/models/asset';
import { isAssetStale } from '../../src/utils/isAssetStale';
import { fetchAssetFromApi } from '../../src/utils/fetchAssetFromApi';
import { serializeAsset, serializeAssets } from '../../src/utils/serializeAssets';
import { AssetDocument } from '../../src/types/assetDocument';
import { searchYahoo } from '../../src/services/yahooFinance';
import { searchDb } from '../../src/utils/db/search';
import { AssetCategory } from '../../src/types/asset';

jest.mock('../../src/models/asset');
jest.mock('../../src/utils/isAssetStale');
jest.mock('../../src/utils/fetchAssetFromApi');
jest.mock('../../src/utils/serializeAssets');
jest.mock('../../src/services/yahooFinance');
jest.mock('../../src/utils/db/search');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

describe('assetController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAsset', () => {
    it('returns 400 if no ID is provided', async () => {
      const req: any = { params: {} };
      const res = mockRes();

      await getAsset(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID parameter is required' });
    });

    it('returns cached asset if not stale', async () => {
      const mockAsset = { uniqueKey: 'stock_TEST' } as AssetDocument;
      const req: any = { params: { id: 'stock_TEST' } };
      const res = mockRes();

      (Asset.findOne as jest.Mock).mockResolvedValue(mockAsset);
      (isAssetStale as jest.Mock).mockReturnValue(false);
      (serializeAsset as jest.Mock).mockReturnValue({ serialized: true });

      await getAsset(req, res);

      expect(Asset.findOne).toHaveBeenCalledWith({ uniqueKey: 'stock_TEST' });
      expect(fetchAssetFromApi).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ serialized: true });
    });

    it('fetches from API if asset is stale or not found', async () => {
      const mockFreshAsset = { uniqueKey: 'stock_TEST' } as AssetDocument;
      const req: any = { params: { id: 'stock_TEST' } };
      const res = mockRes();

      (Asset.findOne as jest.Mock).mockResolvedValue(null);
      (fetchAssetFromApi as jest.Mock).mockResolvedValue(mockFreshAsset);
      (serializeAsset as jest.Mock).mockReturnValue({ serialized: true });

      await getAsset(req, res);

      expect(fetchAssetFromApi).toHaveBeenCalledWith('stock_TEST');
      expect(res.json).toHaveBeenCalledWith({ serialized: true });
    });
  });

  describe('getAssets', () => {
    it('returns 400 if keys query param is missing', async () => {
      const req: any = { query: {} };
      const res = mockRes();

      await getAssets(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'keys query parameter is required' });
    });

    it('returns serialized assets, refreshing stale or missing ones', async () => {
      const req: any = { query: { keys: 'stock_TEST,crypto_BTC' } };
      const res = mockRes();

      const staleAsset = { uniqueKey: 'stock_TEST' } as AssetDocument;
      const fetchedAsset = { uniqueKey: 'stock_TEST' } as AssetDocument;

      (Asset.find as jest.Mock).mockResolvedValue([staleAsset]);
      (isAssetStale as jest.Mock).mockImplementation((a) => a.uniqueKey === 'stock_TEST');
      (fetchAssetFromApi as jest.Mock).mockResolvedValue(fetchedAsset);
      (serializeAssets as jest.Mock).mockReturnValue([{ serialized: true }]);

      await getAssets(req, res);

      expect(Asset.find).toHaveBeenCalledWith({ uniqueKey: { $in: ['stock_TEST', 'crypto_BTC'] } });
      expect(fetchAssetFromApi).toHaveBeenCalledWith('crypto_BTC');
      expect(fetchAssetFromApi).toHaveBeenCalledWith('stock_TEST');
      expect(res.json).toHaveBeenCalledWith([{ serialized: true }]);
    });
  });

  describe('searchAssets', () => {
    it('returns 400 if search query param is missing', async () => {
      const req: any = { query: {} };
      const res = mockRes();

      await searchAssets(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Search query parameter is required' });
    });

    it('returns search results with no type filter', async () => {
      const req: any = { query: { query: 'goog' } };
      const res = mockRes();

      const searchResultsYahoo = [
        {"name":"Alphabet Inc.","type":"stock","symbol":"GOOG"},
        {"name":"Alphabet Inc.","type":"stock","symbol":"GOOGL"}
      ];

      const searchResultsDb = [
        {"name":"Bitcoin.","type":"crypto","symbol":"BTC"},
        {"name":"Ethereum.","type":"crypto","symbol":"ETH"},
      ];

      (searchDb as jest.Mock).mockResolvedValue(searchResultsDb);
      (searchYahoo as jest.Mock).mockResolvedValue(searchResultsYahoo);

      await searchAssets(req, res);

      expect(searchYahoo).toHaveBeenCalledWith('goog');
      expect(searchDb).toHaveBeenCalledWith('goog');
      expect(res.json).toHaveBeenCalledWith([...searchResultsDb,...searchResultsYahoo]);
    });

    it('returns search results with type', async () => {
      const req: any = { query: { query: 'goog', type: AssetCategory.Crypto } };
      const res = mockRes();

      const searchResultsYahoo = [
        {"name":"Alphabet Inc.","type":"stock","symbol":"GOOG"},
        {"name":"Alphabet Inc.","type":"stock","symbol":"GOOGL"}
      ];

      const searchResultsDb = [
        {"name":"Bitcoin.","type":"crypto","symbol":"BTC"},
        {"name":"Ethereum.","type":"crypto","symbol":"ETH"},
      ];

      (searchDb as jest.Mock).mockResolvedValue(searchResultsDb);
      (searchYahoo as jest.Mock).mockResolvedValue(searchResultsYahoo);

      await searchAssets(req, res);

      expect(searchDb).toHaveBeenCalledWith('goog', AssetCategory.Crypto);
      expect(res.json).toHaveBeenCalledWith(searchResultsDb);
    });
  });
});
