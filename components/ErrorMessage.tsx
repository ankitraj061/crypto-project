// src/components/ErrorMessage.tsx
// Shown when Redux async thunk sets error state

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
  }
  
  export default function ErrorMessage({
    message = "Failed to fetch cryptocurrency data.",
    onRetry,
  }: ErrorMessageProps) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-app-negative-bg border border-app-negative-border">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="stroke-app-negative-icon" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-app-syne font-semibold text-app-negative mb-1">
            Something went wrong
          </p>
          <p className="text-xs font-app-mono text-app-text-dim max-w-sm">
            {message}
          </p>
          <p className="text-[10px] font-app-mono text-app-text-footer mt-1">
            Check your network connection or try again shortly.
          </p>
        </div>

        {/* Retry */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 text-xs px-4 py-2 rounded-lg
              bg-app-accent-muted border border-app-accent-muted-border-strong text-app-accent
              font-app-syne font-semibold
              hover:opacity-90 transition-colors"
          >
            ↻ Try again
          </button>
        )}
      </div>
    );
  }