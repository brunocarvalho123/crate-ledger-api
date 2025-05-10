// src/api-managers/polygon.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetCategory, AssetType } from '../types/asset';

dotenv.config();

const baseUrl = "https://api.polygon.io";
const token = process.env.POLYGON_API_TOKEN!;


export const fullMarketSnapshot = async () => {
  const fullUrl = `${baseUrl}/v2/snapshot/locale/us/markets/stocks/tickers`;

  console.log(`Calling polygon.io API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log(response);

  if (response?.data?.count && response.data.count > 0 && response.data.tickers) {
    const now = new Date();

    const assets: AssetType[] = response.data.tickers.map((asset: any) => ({
      name: asset.ticker,
      type: AssetCategory.Stock,
      price: asset.day?.c ||  asset.lastQuote?.["P"],
      symbol: asset.ticker.toUpperCase(),
      createdAt: now,
      updatedAt: now
    }));

    return assets;
  } else {
    console.log(response);
    throw new Error('Unexpected response from CoinGecko API');
  }

}

// Sample response from polygon.io
// {
//   "count": 1,
//   "status": "OK",
//   "tickers": [
//     {
//       "day": {
//         "c": 20.506,
//         "h": 20.64,
//         "l": 20.506,
//         "o": 20.64,
//         "v": 37216,
//         "vw": 20.616
//       },
//       "lastQuote": {
//         "P": 20.6,
//         "S": 22,
//         "p": 20.5,
//         "s": 13,
//         "t": 1605192959994246100
//       },
//       "lastTrade": {
//         "c": [
//           14,
//           41
//         ],
//         "i": "71675577320245",
//         "p": 20.506,
//         "s": 2416,
//         "t": 1605192894630916600,
//         "x": 4
//       },
//       "min": {
//         "av": 37216,
//         "c": 20.506,
//         "h": 20.506,
//         "l": 20.506,
//         "n": 1,
//         "o": 20.506,
//         "t": 1684428600000,
//         "v": 5000,
//         "vw": 20.5105
//       },
//       "prevDay": {
//         "c": 20.63,
//         "h": 21,
//         "l": 20.5,
//         "o": 20.79,
//         "v": 292738,
//         "vw": 20.6939
//       },
//       "ticker": "BCAT",
//       "todaysChange": -0.124,
//       "todaysChangePerc": -0.601,
//       "updated": 1605192894630916600
//     }
//   ]
// }