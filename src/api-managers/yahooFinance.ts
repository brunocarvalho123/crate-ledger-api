// src/api-managers/yahooFinance.ts
import { Asset } from '../models/asset';
import { AssetCategory, AssetType } from '../types/asset';
import yahooFinance from 'yahoo-finance2';

const getAsset = async (type: AssetCategory, symbol: string): Promise<AssetType[]> => {
  const response = await yahooFinance.quote(symbol);

  if (response.symbol === symbol && response.regularMarketPrice && response.longName) {

    const expectedQuoteType = type === AssetCategory.Etf ? "ETF" : "EQUITY";
      
    if (response.quoteType !== expectedQuoteType) {
      throw new Error("Unexpected type in response from yahoo finance API");
    } 

    let assetPrice = response.regularMarketPrice;
    if (response.currency && response.currency !== "USD") {
      const currency = await Asset.findOne({ uniqueKey: `${AssetCategory.Cash}_${response.currency.toUpperCase()}` });
      if (currency) {
        // We always store prices in USD
        assetPrice = assetPrice * currency.price;
      }
    }

    const now = new Date();
    const asset: AssetType = {
      name: response.longName,
      type: type,
      price: assetPrice,
      symbol: response.symbol.toUpperCase(),
      createdAt: now,
      updatedAt: now,
      uniqueKey: `${type}_${response.symbol.toUpperCase()}`
    };

    return [asset];
  } else {
    console.log(response);
    throw new Error('Unexpected response from yahoo finance API');
  }
}

export const getStock = async (symbol: string): Promise<AssetType[]> => {
  return await getAsset(AssetCategory.Stock, symbol);
}

export const getEtf = async (symbol: string): Promise<AssetType[]> => {
  return await getAsset(AssetCategory.Etf, symbol);
}

// Example response from yahoo:
// {
//   language: 'en-US',
//   region: 'US',
//   quoteType: 'ETF',
//   typeDisp: 'ETF',
//   quoteSourceName: 'Delayed Quote',
//   triggerable: false,
//   customPriceAlertConfidence: 'LOW',
//   shortName: 'iShares NASDAQ 100 UCITS ETF US',
//   longName: 'iShares NASDAQ 100 UCITS ETF USD (Acc)',
//   corporateActions: [],
//   regularMarketTime: 2025-05-09T15:35:19.000Z,
//   exchange: 'AMS',
//   messageBoardId: 'finmb_79178139',
//   exchangeTimezoneName: 'Europe/Amsterdam',
//   exchangeTimezoneShortName: 'CEST',
//   gmtOffSetMilliseconds: 7200000,
//   market: 'nl_market',
//   currency: 'EUR',
//   marketState: 'POSTPOST',
//   hasPrePostMarketData: false,
//   firstTradeDateMilliseconds: 2014-10-06T07:00:00.000Z,
//   esgPopulated: false,
//   regularMarketChangePercent: -0.07833801,
//   regularMarketPrice: 1020.4,
//   regularMarketChange: -0.7999878,
//   regularMarketDayHigh: 1028.6,
//   regularMarketDayRange: { low: 1015, high: 1028.6 },
//   regularMarketDayLow: 1015,
//   regularMarketVolume: 2883,
//   regularMarketPreviousClose: 1021.2,
//   bid: 0,
//   ask: 0,
//   bidSize: 0,
//   askSize: 0,
//   fullExchangeName: 'Amsterdam',
//   regularMarketOpen: 1023.6,
//   averageDailyVolume3Month: 5571,
//   averageDailyVolume10Day: 3383,
//   twoHundredDayAverage: 1075.163,
//   twoHundredDayAverageChange: -54.76294,
//   twoHundredDayAverageChangePercent: -0.05093455,
//   netExpenseRatio: 0.3,
//   sourceInterval: 15,
//   exchangeDataDelayedBy: 0,
//   tradeable: false,
//   cryptoTradeable: false,
//   priceHint: 2,
//   symbol: 'CNDX.AS'
// }