// src/api-managers/metalprices.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetCategory, AssetType } from '../types/asset';

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
  const fullUrl = `${baseUrl}/latest?api_key=${token}&base=USD&currencies=${commaSeparatedMetals}`;

  console.log(`Calling metalprices API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl);

  if (response?.data && response.data["success"]) {
    const now = new Date();
    const assets: AssetType[] = Object.entries(trackedMetals).map(([symbol, name]) => {
      const price = (1.0/response.data["rates"][symbol]) || 1;

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
    console.log(response);
    throw new Error('Unexpected response from metalprices API');
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
  


