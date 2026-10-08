# Para Bulk Pregen

A Next.js app that creates EVM pregen wallets in bulk for X (Twitter) usernames and Telegram user IDs. You sign in with Para, load handles from a CSV file or add them by hand, and the app calls a server route once per handle in batches, then shows each wallet address with its status so you can retry failures and download the results. Client-side Para SDK usage lives in `src/components/ParaProvider.tsx` and `src/hooks`; server-side Para usage lives in `src/app/api` and `src/lib/server`.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA`. The server route reads the same API key to create the pregen wallets. The build does not need either value; the sign-in screen shows a warning when the API key is missing.

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, email and X login, and EVM wallets. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Flow

1. Sign in with Para. The workspace appears once you are connected.
2. Add handles. Upload a CSV with `handle,type` rows (the header row is optional, and `type` is `twitter` or `telegram`), or add handles one at a time. `Download template` saves a starter CSV, and `dummy_csv.csv` and `dummy_csv_batch2.csv` hold 40 sample handles each. Uploading a file replaces the current list.
3. Click the create button. The app posts each handle to `/api/wallet/generate` in batches of 5 with a 1 second pause between batches. The route calls `createPregenWallet({ type: "EVM", pregenId })` with `{ xUsername }` for X handles or `{ telegramUserId }` for Telegram handles, reads `getUserShare()`, and keeps the share in an in-memory store.
4. Review the results. Each row shows the wallet address or the error. The retry button sends only the failed rows again, `Download results CSV` saves the handle to address mapping, and `Start new batch` clears everything.

The in-memory store only lasts as long as the server process. In production, save each user share in your own database and protect the route so only your team can call it. When the owner later signs in with that X or Telegram account, your app returns the stored share so they can claim the wallet, as shown in the pregen claim example.

## Para usage

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` (React SDK Lite) and a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/hooks/useBulkPregenWallets.ts` | Posts each handle to `/api/wallet/generate` in batches, tracks progress and per-handle results, and retries failures |
| `src/lib/server/bulkPregenService.ts` | Validates the handle and type, calls `createPregenWallet` and `getUserShare`, and saves the wallet |
| `src/lib/server/paraServerClient.ts` | Builds a new `@getpara/server-sdk` client for each request, so one request never holds another handle's share |
| `src/lib/server/pregenWalletStore.ts` | Keeps each wallet and its user share in memory for this demo |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { stage, progress, results, summary, create, retryFailed, reset } = useBulkPregenWallets();
const { balance, isLoading, isRefreshing, refresh } = useAccountBalance();
```

CSV parsing, the handle list, and pagination are plain React helpers in `src/lib`.

## Project layout

```text
src/
├── app/                              # Next.js layout, page, and API route
├── hooks/                            # Para SDK usage and the bulk request queue, one concern per hook
├── components/
│   ├── ParaProvider.tsx              # Para setup
│   ├── BulkPregenExample.tsx         # Joins the hooks with the UI
│   ├── demos/                        # Handle list and results panels
│   ├── layout/                       # App shell, header, footer, workbench
│   └── ui/                           # Presentational components, props only
├── lib/                              # API types, CSV helpers, handle list, pagination, formatting
│   └── server/                       # Server-only pregen service, Para server client, wallet store
└── styles/globals.css                # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `BulkPregenExample` and the panels in `demos/`, so you can swap them for your own design system without touching the hooks.
