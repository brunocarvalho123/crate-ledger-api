// tests/services/metalprices.test.ts
import axios from 'axios';
import { getAllMetals } from '../../src/services/metalprices';
import { AssetCategory } from '../../src/types/asset';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getAllMetals', () => {
  const mockRates = {
    XAU: 0.0005, // inverse will be 2000
    XAG: 0.05,   // inverse will be 20
    XPT: 0.001,  // inverse will be 1000
    XPD: 0.00067 // inverse will be ~1492.54
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.METALPRICES_API_TOKEN = 'fake-token';
  });

  it('should return formatted metal assets from the API', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        rates: mockRates,
      }
    });

    const result = await getAllMetals();

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('https://api.metalpriceapi.com/v1/latest'));
    expect(result).toHaveLength(4);

    for (const asset of result) {
      expect(asset.type).toBe(AssetCategory.Metal);
      expect(asset.price).toBeGreaterThan(0);
      expect(asset.symbol).toMatch(/XAU|XAG|XPT|XPD/);
      expect(asset.createdAt).toBeInstanceOf(Date);
      expect(asset.updatedAt).toBeInstanceOf(Date);
    }

    const gold = result.find(a => a.symbol === 'XAU');
    expect(gold?.name).toBe('Gold');
    expect(gold?.price).toBeCloseTo(2000, 2);
  });

  it('should throw if response is not successful', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: false,
      }
    });

    await expect(getAllMetals()).rejects.toThrow('Unexpected response from metalprices API');
  });

  it('should throw on invalid data', async () => {
    const badRates = {
      XAU: 'not-a-number'
    };

    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        rates: badRates
      }
    });

    await expect(getAllMetals()).rejects.toThrow('Missing rate for metal: XAU');
  });
});
