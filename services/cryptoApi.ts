// API layer for CoinGecko. Uses NEXT_PUBLIC_API_URL and supports auth headers for future use.

const getBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url) return url.replace(/\/$/, "");
  return "https://api.coingecko.com/api/v3";
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

/** Normalized coin detail from /coins/{id} for the coin detail page */
export interface CoinDetailResponse {
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

/** Safely get USD number from API value (can be object like { usd: 1, eur: 2 } or a number) */
function getUsdNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (value && typeof value === "object" && "usd" in value) {
    const v = (value as { usd?: unknown }).usd;
    if (typeof v === "number" && !Number.isNaN(v)) return v;
  }
  return 0;
}

/** Safely get a number from API (might be nested in .usd or direct) */
function getNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  return getUsdNumber(value);
}

/** Safely get a date string (API may return object like { usd: "2021-11-10..." } or a string) */
function getDateString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "usd" in value) {
    const v = (value as { usd?: unknown }).usd;
    if (typeof v === "string") return v;
  }
  return "";
}

/** Fetch single coin detail; returns normalized CoinDetail for /coin/[id] page */
export async function fetchCoinDetail(id: string): Promise<CoinDetailResponse> {
  const raw = await fetchCoinById(id) as Record<string, unknown>;
  const md = raw.market_data as Record<string, unknown> | undefined;
  const formatDate = (s: string) => {
    if (!s) return "—";
    try {
      const d = new Date(s);
      return isNaN(d.getTime()) ? s : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return s;
    }
  };
  const desc = raw.description as { en?: string } | undefined;
  const athDateRaw = getDateString(md?.ath_date);
  const atlDateRaw = getDateString(md?.atl_date);
  const lastUpdatedRaw = md?.last_updated;
  const lastUpdatedStr =
    typeof lastUpdatedRaw === "string"
      ? lastUpdatedRaw
      : lastUpdatedRaw && typeof lastUpdatedRaw === "object" && "usd" in lastUpdatedRaw
        ? String((lastUpdatedRaw as { usd?: unknown }).usd ?? "")
        : "";
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    symbol: String(raw.symbol ?? "").toUpperCase(),
    image: (raw.image as { large?: string; small?: string } | undefined)?.large ?? (raw.image as { small?: string } | undefined)?.small,
    price: getUsdNumber(md?.current_price),
    marketCap: getUsdNumber(md?.market_cap),
    volume24h: getUsdNumber(md?.total_volume),
    change24h: getNumber(md?.price_change_percentage_24h) ?? 0,
    high24h: getUsdNumber(md?.high_24h),
    low24h: getUsdNumber(md?.low_24h),
    priceChange24h: getNumber(md?.price_change_24h) ?? 0,
    marketCapChange24h: getNumber(md?.market_cap_change_24h) ?? 0,
    marketCapChangePercent24h: getNumber(md?.market_cap_change_percentage_24h) ?? 0,
    circulatingSupply: getNumber(md?.circulating_supply) ?? 0,
    totalSupply: md?.total_supply == null ? null : getNumber(md.total_supply),
    maxSupply: md?.max_supply == null ? null : getNumber(md.max_supply),
    ath: getUsdNumber(md?.ath),
    athDate: formatDate(athDateRaw),
    athChangePercent: getNumber(md?.ath_change_percentage) ?? 0,
    atl: getUsdNumber(md?.atl),
    atlDate: formatDate(atlDateRaw),
    atlChangePercent: getNumber(md?.atl_change_percentage) ?? 0,
    lastUpdated: lastUpdatedStr,
    description: typeof desc?.en === "string" ? desc.en : undefined,
  };
}
