// API layer for CoinGecko. Uses NEXT_PUBLIC_API_URL and supports auth headers for future use.

const getBaseUrl = (): string|undefined => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
};

type RequestInitWithAuth = RequestInit & { headers?: HeadersInit & { Authorization?: string } };

async function request<T>(
  path: string,
  options: RequestInitWithAuth = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(typeof options.headers === "object" && !(options.headers instanceof Headers)
      ? options.headers
      : {}),
  };
  if (process.env.NEXT_PUBLIC_API_KEY) {
    (headers as Record<string, string>).Authorization = `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface MarketsParams {
  vs_currency?: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
}

export async function fetchMarkets(params: MarketsParams = {}): Promise<unknown[]> {
  const search = new URLSearchParams({
    vs_currency: params.vs_currency ?? "usd",
    order: params.order ?? "market_cap_desc",
    per_page: String(params.per_page ?? 10),
    page: String(params.page ?? 1),
    sparkline: String(params.sparkline ?? false),
    ...(params.price_change_percentage
      ? { price_change_percentage: params.price_change_percentage }
      : {}),
  });
  return request<unknown[]>(`/coins/markets?${search.toString()}`);
}

export async function fetchCoinById(id: string): Promise<unknown> {
  const sanitized = id.replace(/[^a-z0-9-]/gi, "");
  if (!sanitized) throw new Error("Invalid coin id");
  return request(`/coins/${encodeURIComponent(sanitized)}`);
}

/** Fetch single coin detail; returns normalized CoinDetail for /coin/[id] page */
export async function fetchCoinDetail(id: string): Promise<{
  id: string;
  name: string;
  symbol: string;
  image?: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
}> {
  const raw = await fetchCoinById(id) as {
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
  };
  const md = raw.market_data;
  return {
    id: raw.id,
    name: raw.name,
    symbol: (raw.symbol ?? "").toUpperCase(),
    image: raw.image?.large ?? raw.image?.small,
    price: md?.current_price?.usd ?? 0,
    marketCap: md?.market_cap?.usd ?? 0,
    volume24h: md?.total_volume?.usd ?? 0,
    change24h: md?.price_change_percentage_24h ?? 0,
  };
}
