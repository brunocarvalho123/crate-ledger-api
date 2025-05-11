// src/services/frankfurter.ts
import axios from 'axios';
import { AssetCategory, AssetType } from '../types/asset';
import { CurrencyMap } from '../types/currencyMap';
import logger from '../utils/logger';
import { UnexpectedApiData } from '../utils/errors/serviceErrors';

const baseUrl = "https://api.frankfurter.dev/v1";

export const getAvailableCurrencies = async () => {
  const fullUrl = `${baseUrl}/currencies`;  
  const response = await axios.get(fullUrl);
  if (response?.data && response.data["EUR"]) {
    return response.data;
  } else {
    throw new UnexpectedApiData('Frankfurter currency list', response);
  }
}

export const getAllCurrencies = async (availableCurrencies: CurrencyMap): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/latest?base=USD`;

  logger.info(`Calling frankfurter API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl);

  if (response?.data && response.data["base"] === "USD") {
    const now = new Date();

    const assets: AssetType[] = Object.entries(availableCurrencies).map(([symbol, name]) => {
      const rawRate = response.data.rates[symbol];
      if ((!rawRate || typeof rawRate !== 'number') && symbol !== 'USD') throw new Error(`Missing rate for symbol: ${symbol}`);
      const price = symbol === 'USD' ? 1.0 : (1.0 / rawRate);

    
      if (typeof symbol !== 'string' || typeof name !== 'string' || typeof price !== 'number') {
        throw new Error(`Invalid data: symbol=${symbol}, name=${name}, price=${price}`);
      }
    
      return {
        name,
        type: AssetCategory.Cash,
        price,
        symbol,
        createdAt: now,
        updatedAt: now,
        uniqueKey: `${AssetCategory.Cash}_${symbol.toUpperCase()}`
      };
    });

    return assets;
  } else {
    throw new UnexpectedApiData('Frankfurter latest', response);
  }
}

// Sample response from frankfurter /latest API
// {
//   "base": "USD",
//   "date": "2025-05-08",
//   "rates": {
//     "AUD": 1.5584,
//     "BGN": 1.7313,
//     "BRL": 5.7462,
//     "CAD": 1.3892
//   }
// }