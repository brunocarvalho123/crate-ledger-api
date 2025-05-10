// src/api-managers/frankfurter.ts
import axios from 'axios';
import { AssetCategory, AssetType } from '../types/asset';

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

export const getAllCurrencies = async (availableCurrencies: any): Promise<AssetType[]> => {
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