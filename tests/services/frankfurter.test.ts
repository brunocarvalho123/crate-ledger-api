import axios from 'axios';
import { getAvailableCurrencies, getAllCurrencies } from '../../src/services/frankfurter';
import { AssetCategory } from '../../src/types/asset';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Frankfurter Currency Service', () => {
  describe('getAvailableCurrencies', () => {
    it('returns currency list when valid', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { EUR: 'Euro', USD: 'US Dollar' }
      });

      const result = await getAvailableCurrencies();
      expect(result).toMatchObject({ EUR: 'Euro', USD: 'US Dollar' });
    });

    it('throws error on invalid response', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await expect(getAvailableCurrencies()).rejects.toThrow('Unexpected response from frankfurter API');
    });

    it('throws error if API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API failed'));

      await expect(getAvailableCurrencies()).rejects.toThrow('API failed');
    });
  });

  describe('getAllCurrencies', () => {
    const availableCurrencies = {
      EUR: 'Euro',
      GBP: 'British Pound'
    };

    const mockRates = {
      base: 'USD',
      rates: {
        EUR: 0.9,
        GBP: 0.8
      }
    };

    it('returns AssetType[] with reversed rates', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockRates });

      const result = await getAllCurrencies(availableCurrencies);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        name: 'Euro',
        symbol: 'EUR',
        type: AssetCategory.Cash,
        price: 1 / 0.9
      });
    });

    it('throws error if response base is not USD', async () => {
      mockedAxios.get.mockResolvedValue({ data: { base: 'EUR' } });

      await expect(getAllCurrencies(availableCurrencies)).rejects.toThrow('Unexpected response from frankfurter API');
    });

    it('throws error if API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API down'));

      await expect(getAllCurrencies(availableCurrencies)).rejects.toThrow('API down');
    });
  });
});
