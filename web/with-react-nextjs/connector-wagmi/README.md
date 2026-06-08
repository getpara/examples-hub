# Para + Wagmi Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-wagmi.vercel.app)

A minimal Next.js example showing Para as a Wagmi connector for Sepolia ETH transfers.

## What This Example Shows

- Configuring `@getpara/wagmi-v2-integration` with a Para client
- Creating a Wagmi config with Para as the wallet connector
- Reading connection and balance state with Wagmi hooks
- Sending Sepolia ETH transactions with Wagmi's `useSendTransaction`

This example uses Wagmi 3 and `@wagmi/core` 3. The remaining install peer warning for `@wagmi/core` comes from mobile/Farcaster-oriented transitive packages that still request the Wagmi 2 core range.

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_sepolia_rpc_url
```

`NEXT_PUBLIC_SEPOLIA_RPC_URL` is optional. The example falls back to `https://ethereum-sepolia-rpc.publicnode.com` when it is not set.

2. Install dependencies:

```bash
yarn install
```

3. Build and start the production server:

```bash
yarn build
yarn start
```

4. Open the app:

```text
http://localhost:3000
```

## Developer Portal Configuration

This example expects Para app identity, authentication methods, theme, and wallet visibility to be configured in the Para Developer Portal for the API key. The Para Wagmi connector still requires an `appName` option to initialize the connector modal; keep it aligned with the Developer Portal display identity. `NEXT_PUBLIC_SEPOLIA_RPC_URL` configures the Wagmi Sepolia transport.

## Core Integration

The Wagmi connector setup lives in `src/config/wagmi.ts`:

```ts
const connector = para
  ? paraConnector({
      appName: "Para Wagmi Example",
      chains: [sepolia],
      onRampTestMode: true,
      options: {},
      para,
      queryClient,
      recoverySecretStepEnabled: true,
    })
  : null;

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: connector ? [connector] : [],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
  },
});
```

The copyable transfer logic lives in `src/hooks/useWagmiEthTransfer.ts`:

```ts
export function useWagmiEthTransfer({ isConnected }: { isConnected: boolean }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { sendTransaction, data: hash, isPending } = useSendTransaction();
  const receipt = useWaitForTransactionReceipt({ hash });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isConnected) return;

    sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return { amount, hash, isLoading: isPending || receipt.isLoading, setAmount, setTo, submit, to };
}
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Server entry for the example
├── components/
│   ├── WagmiExample.tsx        # Client orchestration and SDK hooks
│   ├── ConnectWalletModal.tsx  # Presentational wallet connection modal
│   ├── layout/
│   │   └── Header.tsx          # Presentational header
│   └── ui/
│       ├── BalanceCard.tsx     # Presentational balance display
│       ├── ConnectWalletCard.tsx
│       ├── TransferForm.tsx    # Presentational ETH transfer form
│       └── TransactionHash.tsx # Transaction result display
├── config/
│   ├── constants.ts            # Environment config
│   └── wagmi.ts                # wagmi + Para connector config
├── context/
│   ├── QueryProvider.tsx       # React Query provider
│   └── WagmiProvider.tsx       # wagmi provider setup
├── hooks/
│   ├── useWagmiBalance.ts
│   ├── useWagmiEthTransfer.ts
│   └── useWagmiWalletConnection.ts
└── lib/
    └── para/client.ts          # Para client initialization
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [wagmi Documentation](https://wagmi.sh)
