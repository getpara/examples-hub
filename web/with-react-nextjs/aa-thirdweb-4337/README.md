# Thirdweb Account Abstraction Example

A minimal Next.js example that uses Para as the signer for a Thirdweb EIP-4337 smart account and sends a gas-sponsored transaction on Sepolia.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useParaViemAccount` from `@getpara/react-sdk/evm` for the Para-backed viem account
- Adapting the Para viem account into a Thirdweb personal account
- Creating a Thirdweb smart wallet with gas sponsorship enabled
- Sending a zero-value sponsored transaction through Thirdweb

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
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
- **Thirdweb Client ID**: Get from [Thirdweb Dashboard](https://thirdweb.com/dashboard)

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The Thirdweb client ID remains an environment variable because it configures Thirdweb smart account and paymaster behavior for this example, not Para Portal settings.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout and global styles
│   └── page.tsx                    # Example route
├── components/
│   ├── ParaProvider.tsx            # Para SDK provider setup
│   ├── Thirdweb4337Example.tsx     # Client container for wallet state + UI
│   ├── layout/Header.tsx           # Presentational header
│   └── ui/
│       ├── ConnectCard.tsx         # Connect wallet card
│       ├── WalletInfo.tsx          # Para wallet + smart account display
│       └── SendTransaction.tsx     # Presentational transaction UI
├── hooks/
│   └── useThirdwebSponsoredTransaction.ts
└── lib/
    └── thirdweb.ts                 # Thirdweb configuration
```

## Key Integration Pattern

```typescript
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { createWalletClient, http } from "viem";
import { prepareTransaction, sendTransaction } from "thirdweb";
import { viemAdapter } from "thirdweb/adapters/viem";
import { smartWallet } from "thirdweb/wallets";
import { sepolia as thirdwebSepolia } from "thirdweb/chains";
import { sepolia as viemSepolia } from "viem/chains";

type ThirdwebWalletClient = Parameters<typeof viemAdapter.walletClient.fromViem>[0]["walletClient"];

const { viemAccount } = useParaViemAccount();

if (!viemAccount) {
  return;
}

const walletClient = createWalletClient({
  account: viemAccount,
  chain: viemSepolia,
  transport: http(),
});

const personalAccount = viemAdapter.walletClient.fromViem({
  walletClient: walletClient as unknown as ThirdwebWalletClient,
});

const wallet = smartWallet({
  chain: thirdwebSepolia,
  sponsorGas: true,
});

const smartAccount = await wallet.connect({
  client: thirdwebClient,
  personalAccount,
});

const transaction = prepareTransaction({
  client: thirdwebClient,
  chain: thirdwebSepolia,
  to: "0x000000000000000000000000000000000000dEaD",
  value: BigInt(0),
});

const { transactionHash } = await sendTransaction({
  account: smartAccount,
  transaction,
});
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Thirdweb Documentation](https://portal.thirdweb.com)
- [Thirdweb Smart Wallets](https://portal.thirdweb.com/wallets/smart-wallet)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
