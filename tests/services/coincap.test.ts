// tests/services/coincap.test.ts
import axios from 'axios';
import { getCrypto, getAllAssetsInfo } from '../../src/services/coincap';
import { AssetCategory } from '../../src/types/asset';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoinCap Service', () => {
  const mockAsset = {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    priceUsd: '57435.28'
  };

  describe('getCrypto', () => {
    it('returns transformed asset when found', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [mockAsset]
        }
      });

      const result = await getCrypto('btc');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'Bitcoin',
        symbol: 'BTC',
        price: '57435.28',
        type: AssetCategory.Crypto
      });
    });

    it('throws error when data is null', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: null
        }
      });

      await expect(getCrypto('btc')).rejects.toThrow('Asset not found');
    });

    it('throws error on unexpected shape', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {} // Missing `data.data`
      });

      await expect(getCrypto('btc')).rejects.toThrow('Unexpected response from CoinCap API');
    });

    it('throws error if API call fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API down'));

      await expect(getCrypto('btc')).rejects.toThrow('API down');
    });
  });

  describe('getAllAssetsInfo', () => {
    it('returns transformed array of assets', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: [mockAsset, { ...mockAsset, symbol: 'eth', name: 'Ethereum', priceUsd: '3000' }]
        }
      });

      const result = await getAllAssetsInfo();

      expect(result).toHaveLength(2);
      expect(result[1]).toMatchObject({
        name: 'Ethereum',
        symbol: 'ETH',
        price: 3000,
        type: AssetCategory.Crypto
      });
    });

    it('throws error when data is null', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          data: null
        }
      });

      await expect(getAllAssetsInfo()).rejects.toThrow('Asset not found');
    });

    it('throws error on unexpected shape', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {} // Missing `data.data`
      });

      await expect(getAllAssetsInfo()).rejects.toThrow('Unexpected response from CoinCap API');
    });

    it('throws error if API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Connection refused'));

      await expect(getAllAssetsInfo()).rejects.toThrow('Connection refused');
    });
  });
});
