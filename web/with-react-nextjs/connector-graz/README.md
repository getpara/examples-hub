# Para + Graz Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-graz.vercel.app)

A minimal Next.js example that uses Para as a Graz wallet connector for Cosmos wallet connection and testnet token transfers.

## What This Example Shows

- Setting up `GrazProvider` with the Para Graz connector
- Connecting Para or another available Cosmos wallet through a custom modal
- Reading the connected Cosmos account and balance with Graz hooks
- Sending a Cosmos token transfer with `useSendTokens`

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
```

2. Install dependencies:

```bash
yarn install
```

3. Build and run the production server:

```bash
yarn build
yarn start
```

Open [http://localhost:3000](http://localhost:3000).

For local development, use `yarn dev`.

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only the Graz connector and chain wiring in code.

## Package Resolution

`@getpara/graz-integration@3.0.0` currently publishes a stale peer dependency on `@getpara/react-sdk-lite@2.14.0`. This example resolves `@getpara/graz-integration` to a local file copy with the peer metadata corrected to `3.0.0` until the published SDK package is fixed.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout and global styles
│   └── page.tsx                    # Example route
├── components/
│   ├── GrazExample.tsx             # Client container for wallet state + UI
│   ├── ConnectWalletModal.tsx      # Presentational wallet modal
│   ├── layout/Header.tsx           # Presentational header
│   └── ui/
│       ├── BalanceCard.tsx         # Presentational balance display
│       ├── ConnectWalletCard.tsx   # Connect wallet card
│       ├── Modal.tsx               # Modal shell
│       ├── TransferForm.tsx        # Presentational transfer form
│       └── TransactionHash.tsx     # Transaction result display
├── context/
│   └── Provider.tsx                # Graz provider setup
├── hooks/
│   ├── useGrazTokenTransfer.ts
│   └── useGrazWalletConnection.ts
└── lib/
    └── para/client.ts              # Para client initialization
```

## Key Integration Pattern

```typescript
import { ParaGrazConnector } from "@getpara/graz-integration";
import { ParaWeb } from "@getpara/react-sdk-lite";
import { QueryClient } from "@tanstack/react-query";
import { GrazProvider, defineChainInfo } from "graz";

const queryClient = new QueryClient();
const para = new ParaWeb(process.env.NEXT_PUBLIC_PARA_API_KEY ?? "");

const chain = defineChainInfo({
  chainId: "provider",
  chainName: "Cosmos ICS Provider Testnet",
  rpc: "https://rpc.provider-sentry-01.ics-testnet.polypore.xyz",
  rest: "https://rest.provider-sentry-01.ics-testnet.polypore.xyz",
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "cosmos",
    bech32PrefixAccPub: "cosmospub",
    bech32PrefixValAddr: "cosmosvaloper",
    bech32PrefixValPub: "cosmosvaloperpub",
    bech32PrefixConsAddr: "cosmosvalcons",
    bech32PrefixConsPub: "cosmosvalconspub",
  },
  currencies: [{ coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 }],
  feeCurrencies: [
    {
      coinDenom: "ATOM",
      coinMinimalDenom: "uatom",
      coinDecimals: 6,
      gasPriceStep: { low: 0.01, average: 0.025, high: 0.04 },
    },
  ],
  stakeCurrency: { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GrazProvider
      grazOptions={{
        chains: [chain],
        paraConfig: {
          paraWeb: para,
          connectorClass: ParaGrazConnector,
          queryClient,
        },
      }}>
      {children}
    </GrazProvider>
  );
}
```

The transfer flow lives in `src/hooks/useGrazTokenTransfer.ts` so the copyable Graz logic is separate from the example UI.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Graz Documentation](https://graz.sh)
- [Cosmos SDK Documentation](https://docs.cosmos.network)
