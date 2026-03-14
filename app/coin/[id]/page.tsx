"use client";

// Coin detail uses Redux: fetchCoinDetail thunk loads data into selectedCoin.
// Dashboard polling updates the list; this page fetches single-coin detail from API.

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCoinDetail, clearSelectedCoin } from "@/store/cryptoSlice";
import type { AppDispatch, RootState } from "@/store/store";
import Loader from "@/components/Loader";
import ErrorMessage from "@/components/ErrorMessage";
import PriceBadge from "@/components/PriceBadge";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

function formatNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(6)}`;
}

export default function CoinDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const dispatch = useDispatch<AppDispatch>();
  const { selectedCoin, selectedCoinLoading, selectedCoinError } = useSelector((state: RootState) => state.crypto);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchCoinDetail(id));
    return () => {
      dispatch(clearSelectedCoin());
    };
  }, [id, dispatch]);

  const handleRetry = () => id && dispatch(fetchCoinDetail(id));

  if (selectedCoinLoading && !selectedCoin) {
    return (
      <div className={`${syne.variable} ${mono.variable} ${dm.variable} min-h-screen bg-app-bg`}>
        <Loader />
      </div>
    );
  }

  if (selectedCoinError && !selectedCoin) {
    return (
      <div className={`${syne.variable} ${mono.variable} ${dm.variable} min-h-screen bg-app-bg`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ErrorMessage message={selectedCoinError} onRetry={handleRetry} />
          <Link href="/dashboard" className="text-app-accent text-sm font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedCoin) {
    return (
      <div className={`${syne.variable} ${mono.variable} ${dm.variable} min-h-screen bg-app-bg text-app-text-dim flex items-center justify-center`}>
        <p>No coin data.</p>
        <Link href="/dashboard" className="ml-2 text-app-accent hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const coin = selectedCoin;

  return (
    <div className={`${syne.variable} ${mono.variable} ${dm.variable} min-h-screen bg-app-bg text-app-text-muted`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-app-text-dim hover:text-app-text transition-colors group font-app-syne font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Markets
          </Link>
          <span className="text-app-text-footer">/</span>
          <span className="text-app-text-dim font-app-mono text-xs">{coin.name}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Main card: image, price, market cap, 24h change */}
          <div className="md:col-span-2 bg-app-bg-card border border-app-border rounded-xl p-6">
            <div className="flex items-start gap-4 flex-wrap">
              {coin.image ? (
                <Image
                  src={coin.image}
                  alt={coin.name}
                  width={64}
                  height={64}
                  className="rounded-2xl"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-app-accent-muted border border-app-accent-placeholder-border flex items-center justify-center text-2xl font-bold text-app-accent">
                  {coin.symbol.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="font-app-syne font-extrabold text-2xl text-app-text mb-1">
                  {coin.name}
                </h1>
                <p className="text-xs font-app-mono text-app-text-dim mb-3">
                  {coin.symbol}
                </p>
                <p className="font-app-syne font-extrabold text-3xl text-app-text mb-2">
                  {formatPrice(coin.price)}
                </p>
                <PriceBadge value={coin.change24h} size="md" />
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-gradient-to-br from-app-bg-elevated to-app-bg-card border border-app-border rounded-xl p-4">
            <p className="text-xs font-app-mono text-app-text-dim mb-3">MARKET STATS</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-app-mono text-app-text-dim">Market Cap</span>
                <span className="text-xs font-app-mono text-app-text-muted">{formatNumber(coin.marketCap)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-app-mono text-app-text-dim">24h Volume</span>
                <span className="text-xs font-app-mono text-app-text-muted">{formatNumber(coin.volume24h)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-app-border-subtle">
                <span className="text-xs font-app-mono text-app-text-dim">24h Change</span>
                <PriceBadge value={coin.change24h} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
