// src/api-managers/coincap.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetCategory, AssetType } from '../types/asset';

dotenv.config();

const baseUrl = "https://rest.coincap.io/v3";
const token = process.env.COINCAP_API_TOKEN!;

// rates api, assetsId is an array of the assets id in coincaps api
// use this to update the USD price
export const getMarketRate = async (assetsId: String[]) => {
  const fullUrl = `${baseUrl}/rates?ids=${assetsId.join(',')}`;

  console.log(`Calling CoinCap API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response?.data?.data) {
    const assetsData = response.data.data;
    return assetsData;
  } else if (response?.data?.data === null) {
    throw new Error('Asset not found');
  } else {
    throw new Error('Unexpected response from CoinCap API');
  }
}

// assets api, find asset information by symbol
export const getCrypto = async (symbol: String): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/assets?search=${symbol}&limit=1`;

  console.log(`Calling CoinCap API with url: ${fullUrl}`);
  
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
    throw new Error('Unexpected response from CoinCap API');
  }
}

// assets api, find multiple assets information by coincap id
export const getAssetsInfo = async (assetsId: String[]) => {
  const fullUrl = `${baseUrl}/assets?ids=${assetsId.join(',')}`;

  console.log(`Calling CoinCap API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response?.data?.data) {
    const assetsData = response.data.data;
    return assetsData;
  } else if (response?.data?.data === null) {
    throw new Error('Asset not found');
  } else {
    throw new Error('Unexpected response from CoinCap API');
  }
}

// Use this to get the data to update the top 250 assets
export const getAllAssetsInfo = async (): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/assets?limit=250`;

  console.log(`Calling CoinCap API with url: ${fullUrl}`);
  
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
  } else if (response?.data?.data === null) {
    throw new Error('Asset not found');
  } else {
    throw new Error('Unexpected response from CoinCap API');
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