// tests/services/yahooFinance.test.ts
import { searchYahoo, getStock, getEtf } from '../../src/services/yahooFinance';
import yahooFinance from 'yahoo-finance2';
import { Asset } from '../../src/models/asset';
import { AssetCategory } from '../../src/types/asset';

jest.mock('yahoo-finance2');
jest.mock('../../src/models/asset');

const mockedYahoo = yahooFinance as jest.Mocked<typeof yahooFinance>;
const mockedAssetModel = Asset as jest.Mocked<typeof Asset>;

describe('yahooFinance service', () => {
  describe('searchYahoo', () => {
    it('should return a list of valid assets', async () => {
      mockedYahoo.search.mockResolvedValue({
        quotes: [
          {
            longname: 'Alphabet Inc.',
            symbol: 'GOOG',
            quoteType: 'EQUITY',
          },
          {
            shortname: 'Vanguard S&P 500',
            symbol: 'VOO',
            quoteType: 'ETF',
          },
          {
            quoteType: 'MUTUALFUND', // ignored
          },
        ],
      } as any);

      const result = await searchYahoo('goog');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        name: 'Alphabet Inc.',
        symbol: 'GOOG',
        type: AssetCategory.Stock,
      });
      expect(result[1]).toMatchObject({
        name: 'Vanguard S&P 500',
        symbol: 'VOO',
        type: AssetCategory.Etf,
      });
    });

    it('should throw an error for invalid API response', async () => {
      mockedYahoo.search.mockResolvedValue({ quotes: null } as any);

      await expect(searchYahoo('abc')).rejects.toThrow('Unexpected response from yahoo finance API');
    });
  });

  describe('getStock / getEtf', () => {
    const baseResponse = {
      quoteType: 'EQUITY',
      symbol: 'AAPL',
      longName: 'Apple Inc.',
      regularMarketPrice: 150,
      currency: 'USD',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return a stock asset (no currency conversion)', async () => {
      mockedYahoo.quote.mockResolvedValue(baseResponse as any);

      const result = await getStock('AAPL');

      expect(result[0]).toMatchObject({
        name: 'Apple Inc.',
        symbol: 'AAPL',
        price: 150,
        type: AssetCategory.Stock,
      });
    });

    it('should return an ETF asset (with currency conversion)', async () => {
      mockedYahoo.quote.mockResolvedValue({
        ...baseResponse,
        quoteType: 'ETF',
        symbol: 'CNDX.AS',
        regularMarketPrice: 100,
        currency: 'EUR',
        longName: 'iShares NASDAQ 100',
      } as any);

      mockedAssetModel.findOne.mockResolvedValue({
        price: 1.1,
      } as any);

      const result = await getEtf('CNDX.AS');
      expect(result[0].price).toBeCloseTo(110);
    });

    it('should warn and return asset when currency is not found', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockedYahoo.quote.mockResolvedValue({
        ...baseResponse,
        quoteType: 'ETF',
        symbol: 'CNDX.AS',
        regularMarketPrice: 100,
        currency: 'EUR',
        longName: 'iShares NASDAQ 100',
      } as any);

      mockedAssetModel.findOne.mockResolvedValue(null);

      const result = await getEtf('CNDX.AS');
      expect(warnSpy).toHaveBeenCalledWith('Currency EUR not found in DB. Skipping conversion.');
      expect(result[0].price).toBe(100);
    });

    it('should throw error if quoteType mismatches', async () => {
      mockedYahoo.quote.mockResolvedValue({
        ...baseResponse,
        quoteType: 'ETF',
      } as any);

      await expect(getStock('AAPL')).rejects.toThrow('Unexpected type in response from yahoo finance API');
    });

    it('should throw error if required fields are missing', async () => {
      mockedYahoo.quote.mockResolvedValue({
        quoteType: 'EQUITY',
        symbol: 'AAPL',
      } as any);

      await expect(getStock('AAPL')).rejects.toThrow('Unexpected response from yahoo finance API');
    });
  });
});
