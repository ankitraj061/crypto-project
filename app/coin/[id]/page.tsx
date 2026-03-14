"use client";

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
  if (n >= 1e3) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `$${n.toLocaleString()}`;
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(6)}`;
}

function formatSupply(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toLocaleString();
}

function formatLastUpdated(s: string): string {
  if (!s) return "—";
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return s;
  }
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

  const c = selectedCoin;
  const rangeTotal = c.high24h - c.low24h;
  const rangePercent = rangeTotal > 0 ? ((c.price - c.low24h) / rangeTotal) * 100 : 0;
  const supplyPercent = c.maxSupply && c.maxSupply > 0 ? (c.circulatingSupply / c.maxSupply) * 100 : null;

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
          <span className="text-app-text-dim font-app-mono text-xs">{c.name}</span>
        </div>

        {/* Hero: image, name, price, 24h change */}
        <div className="bg-app-bg-card border border-app-border rounded-xl p-6 mb-4">
          <div className="flex flex-wrap items-start gap-4">
            {c.image ? (
              <Image src={c.image} alt={c.name} width={64} height={64} className="rounded-2xl" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-app-accent-muted border border-app-accent-placeholder-border flex items-center justify-center text-2xl font-bold text-app-accent">
                {c.symbol.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="font-app-syne font-extrabold text-2xl text-app-text mb-1">{c.name}</h1>
              <p className="text-xs font-app-mono text-app-text-dim mb-3">{c.symbol}</p>
              <p className="font-app-syne font-extrabold text-3xl text-app-text mb-2">{formatPrice(c.price)}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <PriceBadge value={c.change24h} size="md" />
                {c.priceChange24h !== 0 && (
                  <span className="text-xs font-app-mono text-app-text-dim">
                    ({c.priceChange24h >= 0 ? "+" : ""}{formatPrice(c.priceChange24h)} 24h)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {/* 24h range */}
          <div className="md:col-span-2 bg-gradient-to-br from-app-bg-elevated to-app-bg-card border border-app-border rounded-xl p-4">
            <p className="text-xs font-app-mono text-app-text-dim mb-3">24H PRICE RANGE</p>
            <div className="flex justify-between text-xs font-app-mono mb-2">
              <span className="text-app-negative">{formatPrice(c.low24h)}</span>
              <span className="text-app-positive">{formatPrice(c.high24h)}</span>
            </div>
            <div className="h-2 bg-app-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-app-negative via-app-accent to-app-positive transition-all"
                style={{ width: `${Math.min(100, Math.max(0, rangePercent))}%` }}
              />
            </div>
            <p className="text-xs font-app-mono text-app-text-dimmer mt-1">Current price in range</p>
          </div>

          {/* Market stats */}
          <div className="bg-gradient-to-br from-app-bg-elevated to-app-bg-card border border-app-border rounded-xl p-4">
            <p className="text-xs font-app-mono text-app-text-dim mb-3">MARKET STATS</p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-app-mono text-app-text-dim">Market Cap</span>
                <span className="text-xs font-app-mono text-app-text-muted">{formatNumber(c.marketCap)}</span>
              </div>
              {c.marketCapChangePercent24h !== 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-app-mono text-app-text-dim">Mkt Cap 24h</span>
                  <PriceBadge value={c.marketCapChangePercent24h} />
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs font-app-mono text-app-text-dim">24h Volume</span>
                <span className="text-xs font-app-mono text-app-text-muted">{formatNumber(c.volume24h)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-app-border-subtle">
                <span className="text-xs font-app-mono text-app-text-dim">24h Change</span>
                <PriceBadge value={c.change24h} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Supply */}
          <div className="bg-app-bg-card border border-app-border rounded-xl p-4">
            <p className="text-xs font-app-mono text-app-text-dim mb-3">SUPPLY</p>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-app-mono text-app-text-dim">Circulating</span>
                <span className="text-xs font-app-mono text-app-text-muted">{formatSupply(c.circulatingSupply)} {c.symbol}</span>
              </div>
              {c.totalSupply != null && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-app-mono text-app-text-dim">Total Supply</span>
                  <span className="text-xs font-app-mono text-app-text-muted">{formatSupply(c.totalSupply)} {c.symbol}</span>
                </div>
              )}
              {c.maxSupply != null && c.maxSupply > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-app-mono text-app-text-dim">Max Supply</span>
                    <span className="text-xs font-app-mono text-app-text-muted">{formatSupply(c.maxSupply)} {c.symbol}</span>
                  </div>
                  <div className="pt-1">
                    <div className="flex justify-between text-xs font-app-mono text-app-text-dimmer mb-0.5">
                      <span>Mined</span>
                      <span>{supplyPercent != null ? supplyPercent.toFixed(1) : "—"}%</span>
                    </div>
                    <div className="h-1.5 bg-app-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-app-accent rounded-full"
                        style={{ width: `${supplyPercent != null ? supplyPercent : 0}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ATH / ATL */}
          <div className="bg-app-bg-card border border-app-border rounded-xl p-4">
            <p className="text-xs font-app-mono text-app-text-dim mb-3">ALL-TIME</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-app-mono text-app-text-dim">All-Time High</span>
                  <span className="text-xs font-app-mono text-app-positive">{formatPrice(c.ath)}</span>
                </div>
                <div className="flex justify-between text-xs font-app-mono text-app-text-dimmer">
                  <span>{c.athDate}</span>
                  <PriceBadge value={c.athChangePercent} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-0.5">
                  <span className="text-xs font-app-mono text-app-text-dim">All-Time Low</span>
                  <span className="text-xs font-app-mono text-app-negative">{formatPrice(c.atl)}</span>
                </div>
                <div className="flex justify-between text-xs font-app-mono text-app-text-dimmer">
                  <span>{c.atlDate}</span>
                  <PriceBadge value={c.atlChangePercent} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Last updated + Description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-app-mono text-app-text-dimmer">
          <span>Last updated: {formatLastUpdated(c.lastUpdated)}</span>
          <span className="text-app-text-footer">Data: CoinGecko</span>
        </div>
        {c.description && (
          <div className="mt-4 bg-app-bg-card border border-app-border rounded-xl p-4">
            <p className="text-xs font-app-mono text-app-text-dim mb-2">ABOUT {c.name.toUpperCase()}</p>
            <p className="text-sm text-app-text-muted leading-relaxed line-clamp-6">{c.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
