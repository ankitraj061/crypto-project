import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMarkets, fetchCoinDetail as fetchCoinDetailApi } from "@/services/cryptoApi";
import type { Coin } from "@/types/crypto";
import type { CoinGeckoMarketItem } from "@/types/crypto";

/** Map coin ids to category for filter (API doesn't return category) */
const COIN_CATEGORY_MAP: Record<string, string> = {
  bitcoin: "Layer 1",
  ethereum: "Layer 1",
  solana: "Layer 1",
  cardano: "Layer 1",
  avalanche: "Layer 1",
  polkadot: "Layer 1",
  "matic-network": "Layer 2",
  arbitrum: "Layer 2",
  optimism: "Layer 2",
  "binancecoin": "Exchange",
  dogecoin: "Meme",
  "shiba-inu": "Meme",
  tether: "Stablecoin",
  "usd-coin": "Stablecoin",
  dai: "Stablecoin",
  uniswap: "DeFi",
  "chainlink": "DeFi",
  aave: "DeFi",
};

function mapMarketToCoin(item: CoinGeckoMarketItem): Coin {
  return {
    id: item.id,
    rank: item.market_cap_rank ?? 0,
    name: item.name,
    symbol: item.symbol.toUpperCase(),
    icon: item.symbol.charAt(0).toUpperCase(),
    image: item.image,
    color: "#00d4ff",
    category: COIN_CATEGORY_MAP[item.id] ?? "Crypto",
    price: item.current_price ?? 0,
    change24h: item.price_change_percentage_24h ?? 0,
    change7d: item.price_change_percentage_7d_in_currency ?? 0,
    marketCap: item.market_cap ?? 0,
    volume: item.total_volume ?? 0,
  };
}

export interface FetchCoinsParams {
  page?: number;
  per_page?: number;
}

export const fetchCoins = createAsyncThunk<
  Coin[],
  FetchCoinsParams | void
>(
  "crypto/fetchCoins",
  async (params, { rejectWithValue }) => {
    try {
      const page = params && typeof params === "object" && "page" in params ? params.page ?? 1 : 1;
      const per_page = params && typeof params === "object" && "per_page" in params ? params.per_page ?? 10 : 10;
      const data = await fetchMarkets({
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page,
        page,
        sparkline: false,
        price_change_percentage: "7d",
      });
      return (data as CoinGeckoMarketItem[]).map(mapMarketToCoin);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Unknown error");
    }
  }
);

export interface CoinDetailState {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}

export const fetchCoinDetail = createAsyncThunk<CoinDetailState, string>(
  "crypto/fetchCoinDetail",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchCoinDetailApi(id);
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : "Unknown error");
    }
  }
);

export type { Coin };

interface CryptoState {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  selectedCoin: CoinDetailState | null;
  selectedCoinLoading: boolean;
  selectedCoinError: string | null;
}

const initialState: CryptoState = {
  coins: [],
  loading: false,
  error: null,
  selectedCoin: null,
  selectedCoinLoading: false,
  selectedCoinError: null,
};

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    clearSelectedCoin(state) {
      state.selectedCoin = null;
      state.selectedCoinError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoins.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.coins = payload;
      })
      .addCase(fetchCoins.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = (payload as string) ?? "Failed to load";
      })
      .addCase(fetchCoinDetail.pending, (state) => {
        state.selectedCoinLoading = true;
        state.selectedCoinError = null;
      })
      .addCase(fetchCoinDetail.fulfilled, (state, { payload }) => {
        state.selectedCoinLoading = false;
        state.selectedCoinError = null;
        state.selectedCoin = payload;
      })
      .addCase(fetchCoinDetail.rejected, (state, { payload }) => {
        state.selectedCoinLoading = false;
        state.selectedCoinError = (payload as string) ?? "Failed to load";
      });
  },
});

export const { clearSelectedCoin } = cryptoSlice.actions;
export default cryptoSlice.reducer;
