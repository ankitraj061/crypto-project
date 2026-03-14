"use client";

import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import { useState, useEffect, useMemo, useCallback } from "react";
import CoinTable from "@/components/CoinTable";
import CoinCard from "@/components/CoinCard";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import { useSelector, useDispatch } from "react-redux";
import { fetchCoins } from "@/store/cryptoSlice";
import type { AppDispatch, RootState } from "@/store/store";
import type { Coin } from "@/types/crypto";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

function sortCoins(coins: Coin[], sortBy: string): Coin[] {
  const arr = [...coins];
  switch (sortBy) {
    case "market_cap_desc":
      return arr.sort((a, b) => b.marketCap - a.marketCap);
    case "market_cap_asc":
      return arr.sort((a, b) => a.marketCap - b.marketCap);
    case "price_desc":
      return arr.sort((a, b) => b.price - a.price);
    case "price_asc":
      return arr.sort((a, b) => a.price - b.price);
    case "change_desc":
      return arr.sort((a, b) => (b.change24h ?? 0) - (a.change24h ?? 0));
    case "change_asc":
      return arr.sort((a, b) => (a.change24h ?? 0) - (b.change24h ?? 0));
    case "volume_desc":
      return arr.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
    case "name_asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}

/** Normalize store Coin for table/card (required fields; includes API image when present) */
function toDisplayCoin(c: Coin): {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  icon: string;
  image?: string;
  color: string;
  category: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
} {
  return {
    id: c.id,
    rank: c.rank ?? 0,
    name: c.name,
    symbol: c.symbol,
    icon: c.icon ?? c.symbol.charAt(0) ?? "?",
    image: c.image,
    color: c.color ?? "#00d4ff",
    category: c.category ?? "Crypto",
    price: c.price,
    change24h: c.change24h ?? 0,
    change7d: c.change7d ?? 0,
    marketCap: c.marketCap,
    volume: c.volume ?? 0,
  };
}

export default function DashboardPage() {
  const { coins, loading, error } = useSelector((state: RootState) => state.crypto);
  const dispatch = useDispatch<AppDispatch>();

  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("USD $");
  const [sortBy, setSortBy] = useState("market_cap_desc");
  const [perPage, setPerPage] = useState("10 / page");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [countdown, setCountdown] = useState(10);

  const perPageNum = useMemo(() => {
    const n = parseInt(perPage.replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : 10;
  }, [perPage]);

  const fetchPage = useCallback(() => {
    dispatch(fetchCoins({ page: currentPage, per_page: perPageNum }));
  }, [dispatch, currentPage, perPageNum]);

  // Initial fetch and when page/perPage change
  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  // Polling: refetch current page every 10s
  useEffect(() => {
    const id = setInterval(fetchPage, 10000);
    return () => clearInterval(id);
  }, [fetchPage]);

  // Countdown UI (resets every 10s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 10 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter: search by name/symbol (basic validation: max length handled in SearchBar)
  const filteredCoins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coins.filter((c: Coin) => {
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q);
      const matchCategory = category === "All" || (c.category ?? "Crypto") === category;
      return matchSearch && matchCategory;
    });
  }, [coins, search, category]);

  const sortedCoins = useMemo(
    () => sortCoins(filteredCoins, sortBy).map(toDisplayCoin),
    [filteredCoins, sortBy]
  );

  const handleRetry = () => fetchPage();
  const handleRefresh = () => fetchPage();

  const hasNextPage = coins.length >= perPageNum;
  const hasPrevPage = currentPage > 1;
  const handlePrevPage = () => {
    if (hasPrevPage) setCurrentPage((p) => p - 1);
  };
  const handleNextPage = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handleExportCsv = useCallback(() => {
    const headers = ["Rank", "Name", "Symbol", "Price (USD)", "24h %", "7d %", "Market Cap", "Volume"];
    const rows = sortedCoins.map((c) => [
      c.rank,
      `"${c.name.replace(/"/g, '""')}"`,
      c.symbol,
      c.price,
      c.change24h.toFixed(2),
      c.change7d.toFixed(2),
      c.marketCap,
      c.volume,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crypto-markets-page-${currentPage}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedCoins, currentPage]);

  return (
    <div className={`${syne.variable} ${mono.variable} ${dm.variable} min-h-screen bg-app-bg text-app-text-muted`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-app-syne font-extrabold text-2xl text-app-text mb-0.5">
              Crypto Markets
            </h1>
            <p className="text-app-text-dim text-sm">
              Top 10 by market cap · Auto-refreshes every 10s
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="text-xs px-3 py-2 flex items-center gap-1.5 font-semibold rounded-lg border border-app-border-strong text-app-text-dim hover:text-app-text transition-colors font-app-syne"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="bg-app-accent text-app-accent-on text-xs px-3 py-2 rounded-lg font-app-syne font-bold hover:bg-app-accent-hover transition-colors flex items-center gap-1.5"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Global stats (static for demo; could be derived from coins) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "GLOBAL MARKET CAP", value: "$2.41T", sub: "▲ 1.82% (24h)", positive: true },
            { label: "24H VOLUME", value: "$94.7B", sub: "▼ 3.14% (24h)", positive: false },
            { label: "BTC DOMINANCE", value: "54.3%", bar: 54.3 },
            { label: "SHOWING", value: `${sortedCoins.length} coins`, sub: "Top 10 from API", neutral: true },
          ].map((stat) => (
            <div key={stat.label} className="bg-gradient-to-br from-app-bg-elevated to-app-bg-card border border-app-border rounded-xl p-4">
              <p className="text-xs font-app-mono text-app-text-dim mb-1">{stat.label}</p>
              <p className="font-app-syne font-bold text-app-text text-lg">{stat.value}</p>
              {stat.sub && (
                <p className={`text-xs font-app-mono mt-0.5 ${stat.positive ? "text-app-positive" : stat.neutral ? "text-app-text-dim" : "text-app-negative"}`}>
                  {stat.sub}
                </p>
              )}
              {stat.bar != null && (
                <div className="mt-2 h-1.5 bg-app-border rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-app-accent to-app-positive rounded-full" style={{ width: `${stat.bar}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="bg-app-bg-card backdrop-blur border border-app-border rounded-xl p-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name or symbol… (e.g. Bitcoin, BTC)"
              resultCount={sortedCoins.length}
            />
          </div>
          <FilterBar
            currency={currency}
            onCurrencyChange={setCurrency}
            sortBy={sortBy}
            onSortChange={setSortBy}
            perPage={perPage}
            onPerPageChange={(v) => {
              setPerPage(v);
              setCurrentPage(1);
            }}
            category={category}
            onCategoryChange={(v) => {
              setCategory(v);
              setCurrentPage(1);
            }}
            resultCount={sortedCoins.length}
          />
        </div>

        {/* View toggle + countdown */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 bg-app-bg-card border border-app-border p-1 rounded-lg">
            {(["table", "card"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`text-xs px-3 py-1.5 rounded font-app-syne font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === mode
                    ? "bg-app-accent-muted border border-app-accent-muted-border-strong text-app-accent"
                    : "text-app-text-dim hover:text-app-text"
                }`}
              >
                {mode === "table" ? "⊞ Table" : "⊟ Cards"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-app-text-dimmer font-app-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-app-positive animate-pulse inline-block" />
            Next refresh in <span className="text-app-accent">{countdown}</span>s
          </div>
        </div>

        {/* Content: loading | error | table/cards */}
        {loading && coins.length === 0 ? (
          <Loader />
        ) : error && coins.length === 0 ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : viewMode === "table" ? (
          <CoinTable
            coins={sortedCoins}
            currentPage={currentPage}
            perPage={perPageNum}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <CoinCard coins={sortedCoins} />
          </div>
        )}
      </div>
    </div>
  );
}
