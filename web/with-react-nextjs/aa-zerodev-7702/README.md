# ZeroDev EIP-7702 Example

A minimal Next.js example that uses Para with ZeroDev to send a gas-sponsored EIP-7702 transaction on Sepolia.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useZeroDevSmartAccount` from `@getpara/react-sdk`
- Enabling ZeroDev EIP-7702 mode for a Para wallet EOA
- Sending a zero-value sponsored transaction through ZeroDev

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your_zerodev_project_id
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

For local development, use `yarn dev`.

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **ZeroDev Project ID**: Get from [ZeroDev Dashboard](https://dashboard.zerodev.app)

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The ZeroDev project ID remains an environment variable because it configures ZeroDev EIP-7702 account and paymaster behavior for this example, not Para Portal settings.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout and global styles
│   └── page.tsx                    # Example route
├── components/
│   ├── ParaProvider.tsx            # Para SDK provider setup
│   ├── ZeroDev7702Example.tsx      # Client container for wallet state + UI
│   ├── layout/Header.tsx           # Presentational header
│   └── ui/
│       ├── ConnectCard.tsx         # Connect wallet card
│       ├── WalletInfo.tsx          # Para wallet + EIP-7702 account display
│       └── SendTransaction.tsx     # Presentational transaction UI
├── hooks/
│   └── useZeroDev7702SponsoredTransaction.ts
└── lib/
    └── zerodev.ts                  # ZeroDev configuration
```

## Key Integration Pattern

```typescript
import { useZeroDevSmartAccount } from "@getpara/react-sdk";
import { sepolia } from "viem/chains";

const { smartAccount, isLoading, error } = useZeroDevSmartAccount({
  projectId: process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID ?? "",
  chain: sepolia,
  mode: "7702",
  enabled: isConnected,
});

if (!smartAccount) {
  return;
}

const receipt = await smartAccount.sendTransaction({
  to: "0x000000000000000000000000000000000000dEaD",
});

console.log(receipt.transactionHash);
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [ZeroDev Documentation](https://docs.zerodev.app)
- [ZeroDev EIP-7702 Guide](https://docs.zerodev.app/sdk/advanced/eip-7702)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
