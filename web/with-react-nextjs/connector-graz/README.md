# Para + Graz Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-graz.vercel.app)

A minimal Next.js app that adds Para as a Graz wallet connector, lets the user pick Para or a Cosmos wallet detected in the browser (Keplr, Leap, Cosmostation), shows the connected account and its ATOM balance on the Cosmos ICS Provider Testnet, and sends ATOM back to the testnet faucet with Graz. The Para and Graz setup lives in `src/components/ParaProvider.tsx` and the Graz hooks live in `src/hooks`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, theme, and login methods. Enable Cosmos wallets for the key: the Para connector only finishes connecting once the signed-in user has a Cosmos wallet.

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
| `src/components/ParaProvider.tsx` | Creates a `ParaWeb` client, passes it to `GrazProvider` as `paraConfig` with `ParaGrazConnector`, defines the ICS Provider Testnet chain, and wraps the app in a React Query client |
| `src/hooks/useGrazWalletConnection.ts` | Lists the wallets available in the browser with `getAvailableWallets` and connects or disconnects with `useConnect`, `useAccount`, and `useDisconnect` |
| `src/hooks/useGrazBalance.ts` | Reads the account balances with `useBalances` and picks out ATOM. An account that holds no ATOM has no entry, so it reads as zero |
| `src/hooks/useGrazTokenTransfer.ts` | Sends ATOM to the faucet with `useSendTokens` and the signing client from `useStargateSigningClient` |

```tsx
const para = new ParaWeb(API_KEY);

<GrazProvider
  grazOptions={{
    chains: [icsProviderTestnet],
    paraConfig: {
      paraWeb: para,
      connectorClass: ParaGrazConnector,
      queryClient,
    },
  }}>
  {children}
</GrazProvider>
```

Choosing Para in the wallet picker calls `connect({ walletType: WalletType.PARA, chainId })`, which opens the Para modal. Once the user signs in, the Para wallet behaves like any other Graz wallet, so `useSendTokens` sends the transfer with the Para signer. An account with no ATOM sees a link to the testnet faucet, and Send transaction stays disabled while the balance is zero.

## Project layout

```text
src/
├── app/                         # Next.js layout and page
├── hooks/                       # Graz hooks, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para connector and Graz setup
│   ├── GrazExample.tsx          # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Chain config, wallet labels, formatting, amount form, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

Components in `layout/` and `ui/` never import Para or Graz. They receive data and callbacks from `GrazExample`, so you can swap them for your own design system without touching the hooks.
