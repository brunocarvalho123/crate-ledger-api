// src/services/frankfurter.ts
import axios from 'axios';
import { AssetCategory, AssetType } from '../types/asset';
import { CurrencyMap } from '../types/currencyMap';

const baseUrl = "https://api.frankfurter.dev/v1";

export const getAvailableCurrencies = async () => {
  const fullUrl = `${baseUrl}/currencies`;  
  const response = await axios.get(fullUrl);
  if (response?.data && response.data["EUR"]) {
    return response.data;
  } else {
    console.log(response);
    throw new Error(`Unexpected response from frankfurter API: ${fullUrl}`);
  }
}

export const getAllCurrencies = async (availableCurrencies: CurrencyMap): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/latest?base=USD`;

  console.log(`Calling frankfurter API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl);

  if (response?.data && response.data["base"] === "USD") {
    const now = new Date();

    const assets: AssetType[] = Object.entries(availableCurrencies).map(([symbol, name]) => {
      const price = (1.0/response.data["rates"][symbol]) || 1;
    
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
    console.log(response);
    throw new Error('Unexpected response from frankfurter API');
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