// tests/services/coingecko.test.ts
import axios from 'axios';
import { getAllAssetsInfo } from '../../src/services/coingecko';
import { AssetCategory } from '../../src/types/asset';
import { UnexpectedApiData } from '../../src/utils/errors/serviceErrors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getAllAssetsInfo', () => {
  const mockApiResponse = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      image: 'https://image.url',
      current_price: 50000
    },
    {
      id: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      image: 'https://image.url',
      current_price: 3000
    }
  ];

  it('fetches and transforms assets correctly', async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockApiResponse
    });

    const result = await getAllAssetsInfo();

    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject({
      name: 'Bitcoin',
      symbol: 'BTC',
      type: AssetCategory.Crypto,
      price: 50000,
      image: 'https://image.url'
    });
    expect(typeof result[0].createdAt).toBe('object');
    expect(typeof result[0].updatedAt).toBe('object');
  });

  it('throws an error if the API returns empty data', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    await expect(getAllAssetsInfo()).rejects.toThrow(UnexpectedApiData);
  });

  it('throws an error if the API fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(getAllAssetsInfo()).rejects.toThrow('Network error');
  });
});
