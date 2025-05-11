import axios from 'axios';
import { getStock } from '../../src/services/fmp';
import { AssetCategory } from '../../src/types/asset';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FMP Stock Service', () => {
  const mockResponse = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 232.8
    }
  ];

  it('returns transformed stock asset when data is valid', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });

    const result = await getStock('aapl');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'Apple Inc.',
      symbol: 'AAPL',
      price: 232.8,
      type: AssetCategory.Stock
    });
  });

  it('throws error when response is empty', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    await expect(getStock('aapl')).rejects.toThrow('Unexpected response from FMP API');
  });

  it('throws error when response is malformed', async () => {
    mockedAxios.get.mockResolvedValue({});

    await expect(getStock('aapl')).rejects.toThrow('Unexpected response from FMP API');
  });

  it('throws error if API call fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API failed'));

    await expect(getStock('aapl')).rejects.toThrow('API failed');
  });
});
