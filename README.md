# CryptoTrack — Crypto Price Dashboard

A **Next.js + TypeScript + Redux Toolkit** app that fetches and displays live cryptocurrency prices from the [CoinGecko API](https://www.coingecko.com/en/api). Built for a frontend intern assignment.

## Features

- **Dashboard** (`/dashboard`): Top 10 coins by market cap in table or card layout
- **Real-time updates**: Data refetches every 10 seconds via Redux async thunk
- **Search**: Filter coins by name or symbol (client-side)
- **Sort & filters**: Sort by market cap, price, 24h change, volume, name; category chips
- **Coin detail** (`/coin/[id]`): Single coin view with image, price, market cap, 24h change
- **Root redirect**: Visiting `/` redirects to `/dashboard`

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Redux Toolkit** (configureStore, createSlice, createAsyncThunk)
- **Tailwind CSS**
- **next/image**, **next/link**, **next/font**

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout, nav, StoreProvider
│   ├── page.tsx            # Redirects to /dashboard
│   ├── dashboard/
│   │   └── page.tsx        # Main dashboard (table/cards, search, filters)
│   └── coin/
│       └── [id]/page.tsx   # Coin detail page
├── components/
│   ├── CoinCard.tsx        # Card layout for a coin
│   ├── CoinTable.tsx       # Table layout for coins
│   ├── PriceBadge.tsx      # % change badge (green/red)
│   ├── Loader.tsx          # Loading state
│   ├── ErrorMessage.tsx    # Error state + retry
│   ├── SearchBar.tsx       # Search input (sanitized)
│   ├── FilterBar.tsx       # Currency, sort, per page, category
│   └── StoreProvider.tsx    # Redux Provider (client)
├── store/
│   ├── store.ts            # configureStore, RootState, AppDispatch
│   └── cryptoSlice.ts      # createSlice + fetchCoins / fetchCoinDetail thunks
├── services/
│   └── cryptoApi.ts        # API layer (uses NEXT_PUBLIC_API_URL, auth-ready)
├── types/
│   └── crypto.ts           # Coin, API response types
└── styles/
    └── (globals.css)
```

## Architecture

- **App Router**: All routes live under `app/` (dashboard, coin/[id], layout).
- **State**: Redux holds `crypto.coins`, `crypto.loading`, `crypto.error` for the list, and `selectedCoin` / `selectedCoinLoading` / `selectedCoinError` for the detail page. Components use `useSelector` and `useDispatch`.
- **Data flow**: Dashboard dispatches `fetchCoins()` on mount and every 10s. Coin detail page dispatches `fetchCoinDetail(id)` when the route id changes. API calls go through `services/cryptoApi.ts`, which uses `NEXT_PUBLIC_API_URL` and supports an optional `NEXT_PUBLIC_API_KEY` for auth headers.

## State Management (Redux)

Redux is used instead of local component state because:

1. **Shared data**: The same coin list can drive the dashboard, a future ticker, and prefill detail views.
2. **Centralized async**: One place for loading/error and refetch logic (thunks).
3. **Predictable updates**: Polling updates the store once; all subscribed components re-render with the same data.

The app uses **configureStore**, **createSlice**, and **createAsyncThunk** from Redux Toolkit. Components use **useSelector** and **useDispatch** from `react-redux`.

## Real-Time Updates

- **Polling**: A `setInterval` in the dashboard runs every **10 seconds** and dispatches `fetchCoins()`. The Redux thunk calls the CoinGecko markets API and updates `state.crypto.coins`, so the table/cards and any other subscribers update automatically.
- **Countdown**: A separate 1s interval updates a “Next refresh in Xs” label for UX.

## API Integration

- **Base URL**: Read from **NEXT_PUBLIC_API_URL** (see `.env.example`). Defaults to `https://api.coingecko.com/api/v3` if unset.
- **Endpoints**:  
  - List: `GET /coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&...`  
  - Detail: `GET /coins/:id`
- **Auth**: The service layer adds an `Authorization: Bearer <NEXT_PUBLIC_API_KEY>` header when `NEXT_PUBLIC_API_KEY` is set (CoinGecko free tier does not require it).
- **Error handling**: Failed requests are caught in the thunk; state is set to `error` and the UI shows **ErrorMessage** with a retry button.

## Security

- **No `dangerouslySetInnerHTML`**: All user-facing text is rendered as plain text/React children.
- **Input validation**: Search input is limited (e.g. `maxLength`) and sanitized (e.g. stripping `<` and `>` in SearchBar). Coin id in the detail route is validated/sanitized before calling the API.
- **API URL in env**: The API base URL is stored in `.env` as `NEXT_PUBLIC_API_URL` and never hardcoded; secrets (e.g. API keys) are not committed.
- **No API keys in code**: Keys are only read from environment variables.

## Getting Started

1. **Install**

   ```bash
   npm install
   ```

2. **Environment** (optional)

   ```bash
   cp .env.example .env.local
   # Edit .env.local if you need a different API URL or key.
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000); you’ll be redirected to `/dashboard`.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## License

Educational use only. Data from CoinGecko.
