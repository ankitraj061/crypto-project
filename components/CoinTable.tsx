// src/components/CoinTable.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import PriceBadge from "@/components/PriceBadge";

interface Coin {
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
}

interface CoinTableProps {
  coins: Coin[];
  currentPage?: number;
  perPage?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onPrevPage?: () => void;
  onNextPage?: () => void;
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

// Tiny sparkline — direction based on 7d change
function Sparkline({ positive }: { positive: boolean }) {
  return (
    <svg width="80" height="32" viewBox="0 0 80 32">
      <polyline
        points={
          positive
            ? "0,28 13,22 26,24 39,16 52,12 65,8 80,6"
            : "0,6 13,10 26,14 39,12 52,18 65,20 80,24"
        }
        fill="none"
        className={positive ? "stroke-app-chart-up" : "stroke-app-chart-down"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CoinTable({
  coins,
  currentPage = 1,
  perPage = 10,
  hasNextPage = false,
  hasPrevPage = false,
  onPrevPage,
  onNextPage,
}: CoinTableProps) {
  if (coins.length === 0) {
    return (
      <div className="bg-app-bg-card border border-app-border rounded-xl py-20 text-center">
        <p className="text-app-text-dim font-app-mono text-sm">
          No coins match your search or filter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-app-bg-card border border-app-border rounded-xl overflow-hidden">
      {/* Header row */}
      <div
        className="grid px-4 py-3 border-b border-app-border text-xs font-app-mono text-app-text-dimmer"
        style={{ gridTemplateColumns: "40px 2fr 1fr 1.2fr 1fr 1.5fr 120px 80px" }}
      >
        <div className="text-center">#</div>
        <div className="flex items-center gap-1 cursor-pointer hover:text-app-accent transition-colors select-none">
          NAME ↕
        </div>
        <div className="text-right flex items-center justify-end gap-1 cursor-pointer hover:text-app-accent transition-colors select-none">
          PRICE <span className="text-app-accent">↓</span>
        </div>
        <div className="text-right cursor-pointer hover:text-app-accent transition-colors select-none">24H %</div>
        <div className="text-right cursor-pointer hover:text-app-accent transition-colors select-none">7D %</div>
        <div className="text-right cursor-pointer hover:text-app-accent transition-colors select-none">MARKET CAP</div>
        <div className="text-right text-app-text-dimmer">7D CHART</div>
        <div className="text-center text-app-text-dimmer">ACTION</div>
      </div>

      {/* Coin rows */}
      {coins.map((coin) => (
        <Link
          key={coin.id}
          href={`/coin/${coin.id}`}
          className="grid items-center px-4 py-3.5 border-b border-app-border-subtle last:border-0
            hover:bg-app-accent-muted hover:border-l-2 hover:border-l-app-accent transition-all"
          style={{ gridTemplateColumns: "40px 2fr 1fr 1.2fr 1fr 1.5fr 120px 80px" }}
        >
          {/* Rank */}
          <div className="text-xs font-app-mono text-app-text-dim text-center">
            {coin.rank}
          </div>

          {/* Name + symbol */}
          <div className="flex items-center gap-3">
            {coin.image ? (
              <Image
                src={coin.image}
                alt={coin.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full shrink-0 object-cover"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{
                  background: `${coin.color}22`,
                  color: coin.color,
                  border: `1px solid ${coin.color}33`,
                }}
              >
                {coin.icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-app-syne font-semibold text-app-text truncate">
                {coin.name}
              </p>
              <p className="text-xs font-app-mono text-app-text-dim">
                {coin.symbol}
              </p>
            </div>
            <span
              className="hidden md:inline text-[10px] px-2 py-0.5 rounded border shrink-0
                bg-app-accent-muted border-app-accent-muted-border text-app-accent font-app-mono"
            >
              {coin.category}
            </span>
          </div>

          {/* Price */}
          <div className="text-right font-app-mono font-semibold text-app-text text-sm">
            {formatPrice(coin.price)}
          </div>

          {/* 24h change */}
          <div className="text-right">
            <PriceBadge value={coin.change24h} />
          </div>

          {/* 7d change */}
          <div className="text-right">
            <PriceBadge value={coin.change7d} />
          </div>

          {/* Market cap + volume */}
          <div className="text-right">
            <p className="text-sm font-app-mono text-app-text-muted">
              {formatNumber(coin.marketCap)}
            </p>
            <p className="text-xs font-app-mono text-app-text-dimmer">
              Vol: {formatNumber(coin.volume)}
            </p>
          </div>

          {/* Sparkline */}
          <div className="flex justify-end">
            <Sparkline positive={coin.change7d >= 0} />
          </div>

          {/* Action */}
          <div className="flex justify-center">
            <span
              className="text-xs px-2.5 py-1.5 rounded
                bg-app-bg-button-ghost border border-app-border-strong
                text-app-text-dim hover:text-app-text hover:border-app-border-hover
                transition-colors font-app-syne font-semibold"
            >
              View
            </span>
          </div>
        </Link>
      ))}

      {/* Footer / pagination */}
      <div className="px-4 py-3 border-t border-app-border-subtle flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs font-app-mono text-app-text-dimmer">
          Page {currentPage} · Showing {(currentPage - 1) * perPage + 1}–{(currentPage - 1) * perPage + coins.length} · Data: CoinGecko
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={!hasPrevPage}
            className="text-xs px-3 py-1.5 rounded font-app-mono
              bg-app-bg-button-ghost border border-app-border-strong
              text-app-text-dim hover:text-app-text hover:border-app-border-hover transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-app-text-dim"
          >
            ← Prev
          </button>
          <span className="text-xs font-app-mono text-app-text-muted px-2">
            {currentPage}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="text-xs px-3 py-1.5 rounded font-app-mono
              bg-app-bg-button-ghost border border-app-border-strong
              text-app-text-dim hover:text-app-text hover:border-app-border-hover transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-app-text-dim"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}