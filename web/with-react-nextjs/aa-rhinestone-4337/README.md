# Rhinestone Account Abstraction Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-rhinestone-4337.vercel.app)

A minimal Next.js app that connects with the Para Modal, creates a Rhinestone ERC-4337 global wallet owned by the Para wallet, and reads its token portfolio across Ethereum, Arbitrum, Base, Polygon, and Optimism. The app only reads data, so no funds move. All Para SDK usage lives in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
RHINESTONE_API_KEY=your_rhinestone_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and wallet visibility. The local `ParaProvider` passes the API key, the environment, and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Contact Rhinestone for an orchestrator API key. It stays a server-side environment variable: the browser calls `/api/orchestrator`, and the route in `src/app/api/orchestrator/[...path]/route.ts` forwards the request to the Rhinestone orchestrator with the key attached. For intent operations, the route only forwards requests whose destination contracts are on its allowlist. `NEXT_PUBLIC_APP_URL` is the proxy base URL during server rendering; in the browser the app uses its own origin.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Para usage

These are the files to copy into your own app.

| File | What it does |
| --- | --- |
| `src/components/ParaProvider.tsx` | Wraps the app in `ParaProvider` and a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useRhinestoneAccount.ts` | Creates the Rhinestone account with the Para wallet as its owner, using `useParaViemAccount` |
| `src/hooks/usePortfolio.ts` | Reads and refreshes the Rhinestone account portfolio with `account.getPortfolio()` |

```tsx
const { address, isConnected, openModal } = useParaModalWallet();
const { account, address: accountAddress, isLoading, errorMessage } = useRhinestoneAccount({ enabled: isConnected });
const { tokenCount, isRefreshing, refresh } = usePortfolio(account);
```

`useRhinestoneAccount` gets a viem account from `useParaViemAccount` and passes it to `rhinestone.createAccount({ owners: { type: "ecdsa", accounts: [viemAccount] } })`, so the Para wallet signs for the Rhinestone account. `usePortfolio` loads the portfolio once the account exists and again when you press Refresh portfolio.

## Project layout

```text
src/
├── app/
│   ├── api/orchestrator/[...path]/  # Server proxy to the Rhinestone orchestrator
│   ├── layout.tsx                   # Next.js layout
│   └── page.tsx                     # Next.js page
├── hooks/                           # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx             # Para setup
│   ├── Rhinestone4337Example.tsx    # Joins the hooks with the UI
│   ├── layout/                      # App shell, header, footer, workbench
│   └── ui/                          # Presentational components, props only
├── lib/                             # Chain list, orchestrator URL, formatting, and UI helpers
└── styles/globals.css               # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `Rhinestone4337Example`, so you can swap them for your own design system without touching the hooks.

## Learn more

- [Para account abstraction guide](https://docs.getpara.com/v3/react/guides/web3-operations/evm/account-abstraction)
- [Rhinestone documentation](https://docs.rhinestone.dev)
- [ERC-4337 specification](https://eips.ethereum.org/EIPS/eip-4337)
