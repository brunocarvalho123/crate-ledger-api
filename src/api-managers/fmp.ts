// src/api-managers/fmp.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetType } from '../types/asset';

dotenv.config();

const baseUrl = "https://financialmodelingprep.com/stable";
const token = process.env.FMP_API_TOKEN!;


// Use this to get the data to get most actively traded stocks
export const getMostActiveStocks = async () => {
  const fullUrl = `${baseUrl}/most-actives?apikey=${token}`;

  console.log(`Calling FMP API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl);

  console.log(response);
  

  if (response?.data && response.data.length > 0) {
    const now = new Date();

    const assets: AssetType[] = response.data.map((asset: any) => ({
      name: asset.name,
      type: 'stock',
      price: asset.price,
      symbol: asset.symbol.toUpperCase(),
      createdAt: now,
      updatedAt: now
    }));

    return assets;
  } else {
    console.log(response);
    throw new Error('Unexpected response from CoinGecko API');
  }
}


// sample object response from FMP
// {
//   "symbol": "NVDA",
//   "price": 111.61,
//   "name": "NVIDIA Corporation",
//   "change": 2.69,
//   "changesPercentage": 2.4697,
//   "exchange": "NASDAQ"
// }