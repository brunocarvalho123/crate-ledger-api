// src/api-managers/coincap.ts
import axios from 'axios';
import dotenv from 'dotenv';

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
export const getAssetInfo = async (assetSymbol: String) => {
  const fullUrl = `${baseUrl}/assets?search=${assetSymbol}&limit=1`;

  console.log(`Calling CoinCap API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response?.data?.data && response.data.data.length === 1) {
    const assetData = response.data.data[0];
    return assetData;
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
export const getAllAssetsInfo = async () => {
  const fullUrl = `${baseUrl}/assets?limit=10`;

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

// Sample object response from coincap
// {
//   id: 'cardano',
//   rank: '9',
//   symbol: 'ADA',
//   name: 'Cardano',
//   supply: '35302796703.7438900000000000',
//   maxSupply: '45000000000.0000000000000000',
//   marketCapUsd: '24649883205.4887852606583134',
//   volumeUsd24Hr: '412956047.6640892167101678',
//   priceUsd: '0.6982416552531841',
//   changePercent24Hr: '-1.9766259953503604',
//   vwap24Hr: '0.7058391538348097',
//   explorer: 'https://cardanoexplorer.com/'
// }