// src/services/metalprices.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetCategory, AssetType } from '../types/asset';
import logger from '../utils/logger';
import { UnexpectedApiData } from '../utils/errors/serviceErrors';

dotenv.config();

const baseUrl = "https://api.metalpriceapi.com/v1";
const token = process.env.METALPRICES_API_TOKEN!;

// Tracked Metals
const trackedMetals = {
  "XAU": "Gold",
  "XAG": "Silver",
  "XPT": "Platinum",
  "XPD": "Palladium"
}

// Use this to get the data to update all metals
export const getAllMetals = async (): Promise<AssetType[]> => {
  const commaSeparatedMetals = Object.entries(trackedMetals).map(([symbol]) => {
    return symbol
  }).join(',');
  const params = new URLSearchParams({
    api_key: token,
    base: 'USD',
    currencies: commaSeparatedMetals
  });
  const fullUrl = `${baseUrl}/latest?${params.toString()}`;

  logger.info(`Calling metalprices API with url: ${fullUrl}`);

  const response = await axios.get(fullUrl);

  if (response?.data && response.data["success"]) {
    const now = new Date();
    const assets: AssetType[] = Object.entries(trackedMetals).map(([symbol, name]) => {
      const rawRate = response.data.rates[symbol];
      if (!rawRate || typeof rawRate != 'number') throw new Error(`Missing rate for metal: ${symbol}`);
      const price = 1.0 / rawRate;


      if (typeof symbol !== 'string' || typeof name !== 'string' || typeof price !== 'number') {
        throw new Error(`Invalid data: symbol=${symbol}, name=${name}, price=${price}`);
      }

      return {
        name,
        type: AssetCategory.Metal,
        price,
        symbol,
        createdAt: now,
        updatedAt: now,
        uniqueKey: `${AssetCategory.Metal}_${symbol.toUpperCase()}`
      };
    });

    return assets;
  } else {
    throw new UnexpectedApiData('Metalprice', response);
  }
}

// Example response from metalsapi
// {
//   success: true,
//   base: 'USD',
//   timestamp: 1746748799,
//   rates: {
//     ADA: 1.4892762375,
//     AED: 3.6730431941,
//     AFN: 71.5003385,
//     ALL: 86.600342919,
//     AMD: 389.279901,
//     ANG: 1.80229
//   }
// }