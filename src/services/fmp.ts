// src/services/fmp.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetCategory, AssetType } from '../types/asset';

dotenv.config();

const baseUrl = "https://financialmodelingprep.com/stable";
const token = process.env.FMP_API_TOKEN!;

export const getStock = async (symbol: string): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/quote?symbol=${symbol.toUpperCase()}&apikey=${token}`;

  console.log(`Calling FMP API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl);
  if (response?.data && response.data.length > 0) {
    const now = new Date();

    const asset: AssetType[] = response.data.map((asset: any) => ({
      name: asset.name,
      type: AssetCategory.Stock,
      price: asset.price,
      symbol: asset.symbol.toUpperCase(),
      createdAt: now,
      updatedAt: now
    }));

    return asset;
  } else {
    console.log(response);
    throw new Error('Unexpected response from FMP API');
  }
}

// [
// 	{
// 		"symbol": "AAPL",
// 		"name": "Apple Inc.",
// 		"price": 232.8,
// 		"changePercentage": 2.1008,
// 		"change": 4.79,
// 		"volume": 44489128,
// 		"dayLow": 226.65,
// 		"dayHigh": 233.13,
// 		"yearHigh": 260.1,
// 		"yearLow": 164.08,
// 		"marketCap": 3500823120000,
// 		"priceAvg50": 240.2278,
// 		"priceAvg200": 219.98755,
// 		"exchange": "NASDAQ",
// 		"open": 227.2,
// 		"previousClose": 228.01,
// 		"timestamp": 1738702801
// 	}
// ]