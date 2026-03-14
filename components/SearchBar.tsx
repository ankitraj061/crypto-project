// src/components/SearchBar.tsx
"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by name or symbol… (e.g. Bitcoin, BTC)",
  resultCount,
}: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic input validation: strip any HTML-like characters
    const sanitized = e.target.value.replace(/[<>]/g, "");
    onChange(sanitized);
  };

  return (
    <div className="relative flex-1">
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-app-icon-muted"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={100}
        autoComplete="off"
        spellCheck={false}
        className="
          w-full
          bg-app-bg-input border border-app-border-input rounded-lg
          pl-9 pr-10 py-2.5
          text-sm text-app-text-muted
          font-app-mono
          placeholder-app-text-dimmer
          focus:outline-none focus:border-app-accent-focus focus:bg-app-bg-input-focus
          transition-all duration-150
        "
      />

      {/* Clear button — only when there's a value */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-dim hover:text-app-text transition-colors"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}

      {/* Result count badge (optional) */}
      {resultCount !== undefined && value && (
        <div className="absolute -bottom-5 left-0 text-[10px] font-app-mono text-app-text-dimmer">
          {resultCount} result{resultCount !== 1 ? "s" : ""} for &quot;{value}&quot;
        </div>
      )}
    </div>
  );
}