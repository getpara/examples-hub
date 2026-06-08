# Para + RainbowKit Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-rainbowkit.vercel.app)

A minimal Next.js example showing Para as a RainbowKit wallet connector with Wagmi message signing.

## What This Example Shows

- Configuring `@getpara/rainbowkit-wallet` with RainbowKit and Wagmi
- Rendering a Para wallet option through `ConnectButton.Custom`
- Reading connection state with Wagmi's `useAccount`
- Signing a message with Wagmi's `useSignMessage`

This example uses the latest compatible RainbowKit stack for the current Para package contract. `@getpara/rainbowkit-wallet@3.0.0` currently peers on `@rainbow-me/rainbowkit@2.2.9`, and RainbowKit 2 peers on Wagmi 2, so this example uses Wagmi 2 rather than Wagmi 3.

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

This example expects Para app identity, branding, authentication methods, theme, wallet visibility, and Para-managed external wallet settings to be configured in the Para Developer Portal for the API key. The local `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` value remains because RainbowKit requires a WalletConnect project ID when building its wagmi connectors, and the RainbowKit `appName` remains because RainbowKit connector metadata requires an app label.

## Core Integration

The RainbowKit connector setup lives in `src/client/wagmi.ts`:

```ts
const paraWallet = getParaWallet({
  para: {
    environment: Environment.BETA,
    apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY || "missing-para-api-key",
  },
  queryClient,
  appName: "Para RainbowKit Example",
  onRampTestMode: true,
  recoverySecretStepEnabled: true,
});

const connectors = connectorsForWallets(
  [
    {
      groupName: "Social Login",
      wallets: [paraWallet],
    },
  ],
  {
    appName: "Para RainbowKit Example",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "missing-walletconnect-project-id",
  }
);
```

The copyable signing logic is isolated in `src/hooks/useSignHelloWorld.ts`:

```ts
export function useSignHelloWorld() {
  const { signMessage, isPending, error, data: signature } = useSignMessage();

  return {
    sign: () => signMessage({ message: "Hello World!" }),
    message: "Hello World!",
    isPending,
    error,
    signature,
  };
}
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Server entry for the example
├── client/
│   └── wagmi.ts                # wagmi + Para connector config
├── components/
│   ├── Providers.tsx           # wagmi + RainbowKit providers
│   ├── RainbowKitExample.tsx   # Client orchestration and SDK hooks
│   ├── layout/Header.tsx       # Header with ConnectButton
│   └── ui/
│       ├── ConnectCard.tsx     # Connect wallet card
│       ├── WalletInfo.tsx      # Connected wallet display
│       └── SignMessage.tsx     # Sign message UI
└── hooks/
    └── useSignHelloWorld.ts    # Custom hook for signing
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [RainbowKit Documentation](https://rainbowkit.com/docs)
- [wagmi Documentation](https://wagmi.sh)
