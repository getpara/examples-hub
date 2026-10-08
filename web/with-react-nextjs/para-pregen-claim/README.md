# Para Pregen Claim

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-para-pregen-claim.vercel.app)

A Next.js app that creates an EVM pregen wallet before the user exists, lets the user claim it by signing in with the mapped email, and then exports the claimed wallet's private key. The side panel compares the expected pregen address with the connected address. Client-side Para SDK usage lives in `src/components/ParaProvider.tsx` and `src/hooks`; server-side Para usage lives in `src/app/api` and `src/lib/server`.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
ENCRYPTION_KEY=your_32_character_encryption_key
KV_REST_API_URL=your_upstash_rest_url
KV_REST_API_TOKEN=your_upstash_rest_token
```

Generate a local encryption key:

```bash
openssl rand -base64 24 | head -c 32
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, email login, EVM wallets, and private key export. The local `ParaProvider` passes the API key, the environment, the pregen share callback, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Flow

1. Enter the email the user will claim with and create the wallet. `/api/wallet/generate` calls `createPregenWallet({ type: "EVM", pregenId: { customId } })` with a random UUID, encrypts the user share, and stores it in Redis with the email mapping for one hour.
2. Click `Begin claim` and sign in with that email in the Para modal. Para calls `fetchPregenWalletsOverride` with the email, which posts to `/api/wallet/share`. That route loads the decrypted share into a new server client with `setUserShare`, calls `updatePregenWalletIdentifier` to move the wallet from the UUID to the email, and returns `getUserShare()` so the SDK claims the wallet during sign in.
3. Once the connected address matches the pregen address, click `Export private key` to open the Para export pop-up for that wallet.

## Para usage

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` (React SDK Lite) and a React Query client, and passes `fetchPregenWalletsOverride` |
| `src/hooks/usePregenWallet.ts` | Creates the pregen wallet through `/api/wallet/generate` and keeps its UUID, wallet ID, address, and email |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useExportWalletKey.ts` | Opens the private key export pop-up with `useExportPrivateKey` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |
| `src/lib/server/pregenClaimService.ts` | Creates the pregen wallet and moves its identifier from the UUID to the email |
| `src/lib/server/paraServerClient.ts` | Builds a new `@getpara/server-sdk` client for each request, so one request never holds another user's share |

```tsx
const { email, setEmail, wallet, isCreating, errorMessage, create } = usePregenWallet();
const { address, isConnected, isModalOpen, openModal } = useParaModalWallet();
const { exportKey, isPending, isOpened } = useExportWalletKey();
```

The API routes run on the server. `src/lib/server/encryption.ts` encrypts the user share with `ENCRYPTION_KEY`, and `src/lib/server/keySharesDB.ts` stores it in Upstash Redis.

## Project layout

```text
src/
├── app/                         # Next.js layout, page, and API routes
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup and the pregen share callback
│   ├── PregenClaimExample.tsx   # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, API types, step and fact helpers, formatting
│   └── server/                  # Server-only pregen service, Para server client, encryption, Redis
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `PregenClaimExample`, so you can swap them for your own design system without touching the hooks.
