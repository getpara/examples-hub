# Para + Reown AppKit Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-reown-appkit.vercel.app)

A minimal Next.js example showing Para as a custom Wagmi connector inside Reown AppKit.

## What This Example Shows

- Configuring Reown AppKit with `@getpara/wagmi-v2-integration`
- Creating the AppKit Wagmi adapter with a Para connector
- Opening the AppKit modal through `useAppKit`
- Reading account, network, balance, and disconnect state from Reown AppKit and Wagmi

This example uses Reown AppKit's current Wagmi adapter with Wagmi 3 and `@wagmi/core` 3. The remaining install peer warning for `@wagmi/core` comes from mobile/Farcaster-oriented transitive packages that still request the Wagmi 2 core range.

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

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

Configure the API key in the Para Developer Portal with the app display identity, authentication methods, branding, theme, and wallet visibility. This example does not set `paraModalConfig`, `configOverrides`, or `externalWalletConfig` in app code.

The `paraConnector({ appName })` value remains in code because `@getpara/wagmi-v2-integration` requires it to initialize the connector modal; keep it aligned with the Developer Portal display identity. The Reown AppKit metadata, feature flags, chain list, and WalletConnect project ID also remain in code because they configure Reown AppKit and wagmi provider behavior, not Para Portal partner configuration.

## Core Integration

The AppKit connector setup lives in `src/config/appkit.ts`:

```ts
const connector = paraConnector({
  para,
  chains: [...chains],
  appName: "Reown AppKit with Para",
  queryClient,
  onRampTestMode: true,
  recoverySecretStepEnabled: true,
  options: {},
});

export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  networks: [...chains],
  projectId,
  connectors: [connector],
});
```

The copyable wallet state lives in `src/hooks/useReownAppKitWallet.ts`:

```ts
export function useReownAppKitWallet() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { caipNetwork } = useAppKitNetwork();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  });

  return {
    address,
    disconnectWallet: disconnect,
    isConnected,
    networkName: caipNetwork?.name || "Unknown",
    openAppKit: open,
  };
}
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with AppKitProvider
│   └── page.tsx                # Server entry for the example
├── components/
│   ├── ReownAppKitExample.tsx  # Client orchestration and SDK hooks
│   ├── layout/
│   │   └── Header.tsx          # Presentational header
│   └── ui/
│       ├── ConnectWalletCard.tsx
│       └── WalletDisplay.tsx   # Presentational wallet display
├── config/
│   └── appkit.ts               # AppKit configuration
├── context/
│   └── AppKitProvider.tsx      # Reown AppKit provider
├── hooks/
│   └── useReownAppKitWallet.ts # Reown AppKit and Wagmi logic
└── lib/
    └── para/client.ts          # Para client initialization
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Reown AppKit Documentation](https://docs.reown.com/appkit/overview)
- [wagmi Documentation](https://wagmi.sh)
