// src/api-managers/coingecko.ts
import axios from 'axios';
import dotenv from 'dotenv';
import { AssetType, AssetCategory } from '../types/asset';

dotenv.config();

const baseUrl = "https://api.coingecko.com/api/v3";
const token = process.env.COINGECKO_API_TOKEN!;


// Use this to get the data to update the top 250 assets
export const getAllAssetsInfo = async (): Promise<AssetType[]> => {
  const fullUrl = `${baseUrl}/coins/markets?vs_currency=usd&per_page=250`;

  console.log(`Calling CoinGecko API with url: ${fullUrl}`);
  
  const response = await axios.get(fullUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response?.data && response.data.length > 0) {
    const now = new Date();

    const assets: AssetType[] = response.data.map((asset: any) => ({
      name: asset.name,
      type: AssetCategory.Crypto,
      price: asset.current_price,
      symbol: asset.symbol.toUpperCase(),
      image: asset.image,
      createdAt: now,
      updatedAt: now
    }));

    return assets;
  } else {
    console.log(response);
    throw new Error('Unexpected response from CoinGecko API');
  }
}


// Sample object response from coingecko
// {
//   id: 'cardano',
//   symbol: 'ada',
//   name: 'Cardano',
//   image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png?1696502090',
//   current_price: 0.697937,
//   market_cap: 25158810844,
//   market_cap_rank: 9,
//   fully_diluted_valuation: 31419179044,
//   total_volume: 719523576,
//   high_24h: 0.716007,
//   low_24h: 0.690498,
//   price_change_24h: -0.014880779573941627,
//   price_change_percentage_24h: -2.0876,
//   market_cap_change_24h: -522130605.60726166,
//   market_cap_change_percentage_24h: -2.03314,
//   circulating_supply: 36033611393.89443,
//   total_supply: 45000000000,
//   max_supply: 45000000000,
//   ath: 3.09,
//   ath_change_percentage: -77.38815,
//   ath_date: '2021-09-02T06:00:10.474Z',
//   atl: 0.01925275,
//   atl_change_percentage: 3525.4972,
//   atl_date: '2020-03-13T02:22:55.044Z',
//   roi: null,
//   last_updated: '2025-04-30T09:52:20.335Z'
// }