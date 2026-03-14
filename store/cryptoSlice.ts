/**
 * Crypto slice: coins list + selected coin detail.
 * Redux is used instead of local state so: (1) coin data is shared across dashboard, detail page, and future components;
 * (2) loading/error and refetch logic live in one place (thunks); (3) polling updates the store once and all subscribers re-render.
 */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMarkets, fetchCoinDetail as fetchCoinDetailApi } from "@/services/cryptoApi";
import type { Coin } from "@/types/crypto";
import type { CoinGeckoMarketItem } from "@/types/crypto";

/** Ensure we never store currency objects (e.g. { usd, eur, ... }) — normalize to primitives */
function toNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (v && typeof v === "object" && "usd" in v) {
    const u = (v as { usd?: unknown }).usd;
    if (typeof u === "number" && !Number.isNaN(u)) return u;
  }
  return 0;
}
function toStr(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "usd" in v) {
    const u = (v as { usd?: unknown }).usd;
    if (typeof u === "string") return u;
  }
  return v != null ? String(v) : "";
}
function normalizeCoinDetail(p: CoinDetailState): CoinDetailState {
  return {
    id: toStr(p.id),
    name: toStr(p.name),
    symbol: toStr(p.symbol),
    image: p.image != null ? toStr(p.image) : undefined,
    price: toNum(p.price),
    marketCap: toNum(p.marketCap),
    volume24h: toNum(p.volume24h),
    change24h: toNum(p.change24h),
    high24h: toNum(p.high24h),
    low24h: toNum(p.low24h),
    priceChange24h: toNum(p.priceChange24h),
    marketCapChange24h: toNum(p.marketCapChange24h),
    marketCapChangePercent24h: toNum(p.marketCapChangePercent24h),
    circulatingSupply: toNum(p.circulatingSupply),
    totalSupply: p.totalSupply == null ? null : toNum(p.totalSupply),
    maxSupply: p.maxSupply == null ? null : toNum(p.maxSupply),
    ath: toNum(p.ath),
    athDate: toStr(p.athDate),
    athChangePercent: toNum(p.athChangePercent),
    atl: toNum(p.atl),
    atlDate: toStr(p.atlDate),
    atlChangePercent: toNum(p.atlChangePercent),
    lastUpdated: toStr(p.lastUpdated),
    description: p.description != null ? toStr(p.description) : undefined,
  };
}

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
    price: toNum(item.current_price as unknown),
    change24h: toNum(item.price_change_percentage_24h as unknown),
    change7d: toNum(item.price_change_percentage_7d_in_currency as unknown),
    marketCap: toNum(item.market_cap as unknown),
    volume: toNum(item.total_volume as unknown),
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
  high24h: number;
  low24h: number;
  priceChange24h: number;
  marketCapChange24h: number;
  marketCapChangePercent24h: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number;
  athDate: string;
  athChangePercent: number;
  atl: number;
  atlDate: string;
  atlChangePercent: number;
  lastUpdated: string;
  description?: string;
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
        state.selectedCoin = normalizeCoinDetail(payload as CoinDetailState);
      })
      .addCase(fetchCoinDetail.rejected, (state, { payload }) => {
        state.selectedCoinLoading = false;
        state.selectedCoinError = (payload as string) ?? "Failed to load";
      });
  },
});

export const { clearSelectedCoin } = cryptoSlice.actions;
export default cryptoSlice.reducer;
