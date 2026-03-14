// src/components/PriceBadge.tsx
// Reusable coloured % badge — used in table, cards, and coin detail

interface PriceBadgeProps {
    value: number;          // percentage value, e.g. 1.24 or -3.5
    showArrow?: boolean;    // default true
    size?: "sm" | "md";    // default "sm"
  }
  
  export default function PriceBadge({
    value,
    showArrow = true,
    size = "sm",
  }: PriceBadgeProps) {
    const positive = value >= 0;
  
    const sizeClass =
      size === "md"
        ? "text-sm px-3 py-1.5"
        : "text-xs px-2 py-0.5";
  
    return (
      <span
        className={`inline-flex items-center gap-0.5 rounded border font-app-mono ${sizeClass} ${
          positive
            ? "bg-app-positive-bg border-app-positive-border text-app-positive"
            : "bg-app-negative-bg border-app-negative-border text-app-negative"
        }`}
      >
        {showArrow && (positive ? "▲" : "▼")}{" "}
        {Math.abs(value).toFixed(2)}%
      </span>
    );
  }