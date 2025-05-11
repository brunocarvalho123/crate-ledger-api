// src/services/coincap.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetCategory, AssetType } from '../types/asset';
import logger from '../utils/logger';
import { UnexpectedApiData } from '../utils/errors/serviceErrors';

dotenv.config();

const baseUrl = "https://rest.coincap.io/v3";
const token = process.env.COINCAP_API_TOKEN!;

// assets api, find asset information by symbol
export const getCrypto = async (symbol: string): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/assets?search=${symbol}&limit=1`;

  logger.info(`Calling CoinCap search API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response?.data?.data && response.data.data.length === 1) {
    const now = new Date();
    const asset: AssetType[] = response.data.data.map((asset: any) => ({
      name: asset.name,
      type: AssetCategory.Crypto,
      price: asset.priceUsd,
      symbol: asset.symbol.toUpperCase(),
      createdAt: now,
      updatedAt: now
    }));
    return asset;
  } else if (response?.data?.data === null) {
    throw new Error('Asset not found');
  } else {
    throw new UnexpectedApiData('CoinCap search', response);
  }
}

// Use this to get the data to update the top 250 assets
export const getAllAssetsInfo = async (): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/assets?limit=250`;

  logger.info(`Calling CoinCap API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response?.data?.data) {
    const now = new Date();

    const assets: AssetType[] = response.data.data.map((asset: any) => ({
      name: asset.name,
      type: AssetCategory.Crypto,
      price: Number(asset.priceUsd),
      symbol: asset.symbol.toUpperCase(),
      createdAt: now,
      updatedAt: now
    }));

    return assets;
  } else {
    throw new UnexpectedApiData('CoinCap', response);
  }
}

// Sample object response from coincap
// {
//   "timestamp": 1726081635506,
//   "data": [
//     {
//       "id": "bitcoin",
//       "rank": "1",
//       "symbol": "BTC",
//       "name": "Bitcoin",
//       "supply": "19752815.0000000000000000",
//       "maxSupply": "21000000.0000000000000000",
//       "marketCapUsd": "1134508584478.0989721079862315",
//       "volumeUsd24Hr": "7243846863.3409126543165751",
//       "priceUsd": "57435.2862859343831301",
//       "changePercent24Hr": "-0.0461491427646531",
//       "vwap24Hr": "57868.1484672081301126",
//       "explorer": "https://blockchain.info/werweqrerwerw"
//     }
//   ]
// }