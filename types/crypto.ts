// Shared types for API responses and app state

export interface CoinGeckoMarketItem {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  market_cap: number;
  market_cap_rank?: number;
  total_volume?: number;
  price_change_percentage_24h?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
}

export interface Coin {
  id: string;
  rank?: number;
  name: string;
  symbol: string;
  icon?: string;
  image?: string;
  color?: string;
  category?: string;
  price: number;
  change24h?: number;
  change7d?: number;
  marketCap: number;
  volume?: number;
}

/** CoinGecko /coins/{id} response shape (subset we use) */
export interface CoinGeckoDetailResponse {
  id: string;
  symbol: string;
  name: string;
  image?: { small?: string; large?: string };
  market_data?: {
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    price_change_percentage_24h?: number | null;
  };
}

export interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}
