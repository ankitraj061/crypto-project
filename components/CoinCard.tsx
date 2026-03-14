// src/components/CoinCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

interface Coin {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  icon: string;
  image?: string;
  color: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume: number;
}

interface CoinCardProps {
  coins: Coin[];
}

function formatNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(2)}`;
}

function formatPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 1) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

function MiniChart({ positive }: { positive: boolean }) {
  return (
    <svg className="w-full" height="40" viewBox="0 0 120 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={positive ? "var(--app-chart-up)" : "var(--app-chart-down)"} stopOpacity="0.15" />
          <stop offset="100%" stopColor={positive ? "var(--app-chart-up)" : "var(--app-chart-down)"} stopOpacity="0" />
        </linearGradient>
      </defs>
      {positive ? (
        <>
          <polygon
            points="0,36 20,28 40,30 60,18 80,12 100,8 120,4 120,40 0,40"
            fill={`url(#grad-${positive})`}
          />
          <polyline
            points="0,36 20,28 40,30 60,18 80,12 100,8 120,4"
            fill="none"
            className="stroke-app-chart-up"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <polygon
            points="0,4 20,8 40,16 60,14 80,20 100,28 120,36 120,40 0,40"
            fill={`url(#grad-${positive})`}
          />
          <polyline
            points="0,4 20,8 40,16 60,14 80,20 100,28 120,36"
            fill="none"
            className="stroke-app-chart-down"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function CoinCard({ coins }: CoinCardProps) {
  if (coins.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-app-text-dim font-app-mono text-sm">
          No coins match your search or filter.
        </p>
      </div>
    );
  }

  return (
    <>
      {coins.map((coin) => (
        <Link
          key={coin.id}
          href={`/coin/${coin.id}`}
          className="bg-app-bg-card border border-app-border rounded-xl p-4
            hover:border-app-accent-muted-border-strong hover:bg-app-accent-muted
            hover:shadow-[0_0_20px_rgba(0,212,255,0.08)]
            transition-all duration-200 cursor-pointer group flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {coin.image ? (
                <Image
                  src={coin.image}
                  alt={coin.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full shrink-0 object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold shrink-0"
                  style={{
                    background: `${coin.color}22`,
                    color: coin.color,
                    border: `1px solid ${coin.color}33`,
                  }}
                >
                  {coin.icon}
                </div>
              )}
              <div>
                <p className="text-sm font-app-syne font-bold text-app-text group-hover:text-app-accent transition-colors">
                  {coin.name}
                </p>
                <p className="text-xs font-app-mono text-app-text-dim">
                  {coin.symbol} · #{coin.rank}
                </p>
              </div>
            </div>

            {/* 24h badge */}
            <span
              className={`text-[10px] px-2 py-0.5 rounded border font-app-mono shrink-0 ${
                coin.change24h >= 0
                  ? "bg-app-positive-bg border-app-positive-border text-app-positive"
                  : "bg-app-negative-bg border-app-negative-border text-app-negative"
              }`}
            >
              {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}%
            </span>
          </div>

          {/* Price */}
          <p className="font-app-mono font-semibold text-xl text-app-text mb-0.5">
            {formatPrice(coin.price)}
          </p>

          {/* Market cap */}
          <p className="text-xs font-app-mono text-app-text-dim mb-1">
            Mkt Cap:{" "}
            <span className="text-app-text-muted">{formatNumber(coin.marketCap)}</span>
          </p>

          {/* Vol */}
          <p className="text-xs font-app-mono text-app-text-dimmer mb-3">
            Vol (24h):{" "}
            <span className="text-app-text-dim">{formatNumber(coin.volume)}</span>
          </p>

          {/* 7d mini chart */}
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-app-mono text-app-text-dimmer">7D</span>
              <span
                className={`text-[10px] font-app-mono ${
                  coin.change7d >= 0 ? "text-app-positive" : "text-app-negative"
                }`}
              >
                {coin.change7d >= 0 ? "▲" : "▼"} {Math.abs(coin.change7d).toFixed(2)}%
              </span>
            </div>
            <MiniChart positive={coin.change7d >= 0} />
          </div>
        </Link>
      ))}
    </>
  );
}