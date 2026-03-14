// src/components/Loader.tsx
// Shown while Redux async thunk is fetching (loading === true in store)

export default function Loader() {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        {/* Spinning ring */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-2 border-app-bg-loader-ring"
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-app-accent animate-spin"
          />
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-xs font-app-mono text-app-text-dim animate-pulse">
            Fetching live prices…
          </p>
          <p className="text-[10px] font-app-mono text-app-text-footer mt-0.5">
            via CoinGecko API
          </p>
        </div>

        {/* Skeleton rows */}
        <div className="w-full max-w-4xl mt-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 bg-app-bg-card rounded-lg animate-pulse"
              style={{ opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      </div>
    );
  }