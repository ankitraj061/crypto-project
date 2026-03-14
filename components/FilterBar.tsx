// src/components/FilterBar.tsx
"use client";

interface FilterBarProps {
  currency: string;
  onCurrencyChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  perPage: string;
  onPerPageChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  resultCount: number;
}

const CURRENCIES = ["USD $", "EUR €", "GBP £", "BTC ₿", "ETH Ξ", "INR ₹"];

const SORT_OPTIONS = [
  { value: "market_cap_desc", label: "Sort: Market Cap ↓" },
  { value: "market_cap_asc",  label: "Sort: Market Cap ↑" },
  { value: "price_desc",      label: "Sort: Price ↓"      },
  { value: "price_asc",       label: "Sort: Price ↑"      },
  { value: "change_desc",     label: "Sort: 24h Change ↓" },
  { value: "change_asc",      label: "Sort: 24h Change ↑" },
  { value: "volume_desc",     label: "Sort: Volume ↓"     },
  { value: "name_asc",        label: "Sort: Name A–Z"     },
];

const PER_PAGE_OPTIONS = ["10 / page", "25 / page", "50 / page", "100 / page"];

const CATEGORIES = [
  "All", "Layer 1", "Layer 2", "DeFi",
  "Stablecoin", "NFT", "Meme", "Exchange",
];

const selectClass = `
  text-xs px-3 py-2.5
  font-app-mono
  bg-app-bg-elevated border border-app-border-strong text-app-text-muted
  rounded-lg cursor-pointer outline-none
  hover:border-app-border-hover transition-colors
  [&>option]:bg-app-bg
`;

export default function FilterBar({
  currency, onCurrencyChange,
  sortBy, onSortChange,
  perPage, onPerPageChange,
  category, onCategoryChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="bg-app-bg-card backdrop-blur border border-app-border rounded-xl p-4">
      {/* Row 1: selects */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={currency} onChange={(e) => onCurrencyChange(e.target.value)} className={selectClass}>
          {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select value={sortBy} onChange={(e) => onSortChange(e.target.value)} className={selectClass}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Order (ascending / descending) — visual only for UI demo */}
        <select defaultValue="desc" className={selectClass}>
          <option value="desc">↓ Descending</option>
          <option value="asc">↑ Ascending</option>
        </select>

        <select value={perPage} onChange={(e) => onPerPageChange(e.target.value)} className={selectClass}>
          {PER_PAGE_OPTIONS.map((p) => <option key={p}>{p}</option>)}
        </select>

        <span className="ml-auto text-xs font-app-mono text-app-text-dimmer hidden sm:block">
          {resultCount} coins
        </span>
      </div>

      {/* Row 2: category chips */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-xs text-app-text-dimmer font-app-mono shrink-0">Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-xs px-2.5 py-0.5 rounded border font-app-mono transition-all ${
              category === cat
                ? "bg-app-accent-muted border-app-accent-focus text-app-accent"
                : "bg-app-bg-card border-app-border-strong text-app-text-dim hover:text-app-text hover:border-app-border-hover"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}