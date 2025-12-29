# Thirdweb Account Abstraction Example

A minimal Next.js example demonstrating Para SDK integration with Thirdweb for EIP-4337 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating Thirdweb smart accounts with Para as the signer
- Sending gas-sponsored transactions via Thirdweb's paymaster

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Thirdweb Client ID**: Get from [Thirdweb Dashboard](https://thirdweb.com/dashboard)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout with ParaProvider
│   └── page.tsx                    # Main page with wallet + transaction UI
├── components/
│   ├── ParaProvider.tsx            # Para SDK provider setup
│   ├── layout/Header.tsx           # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx         # Connect wallet card
│       ├── WalletInfo.tsx          # EOA + Smart Account display
│       └── SendTransaction.tsx     # Sponsored transaction UI
├── hooks/
│   ├── useSmartAccountClient.ts    # Thirdweb smart account setup
│   └── useSendUserOperation.ts     # Transaction sending hook
└── lib/
    └── thirdweb.ts                 # Thirdweb configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createWalletClient, http } from "viem";
import { smartWallet } from "thirdweb/wallets";
import { viemAdapter } from "thirdweb/adapters/viem";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create wallet client
const walletClient = createWalletClient({
  account: viemAccount,
  chain: sepolia,
  transport: http(),
});

// Adapt to Thirdweb wallet
const paraWallet = viemAdapter.walletClient.fromViem({ walletClient });

// Create Thirdweb smart wallet with gas sponsorship
const wallet = smartWallet({
  chain: sepolia,
  sponsorGas: true,
});

const smartAccount = await wallet.connect({
  client: thirdwebClient,
  personalAccount: paraWallet,
});

// Send sponsored transaction
const tx = prepareTransaction({ client, chain, to, data, value });
const result = await sendTransaction({ account: smartAccount, transaction: tx });
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Thirdweb Documentation](https://portal.thirdweb.com)
- [Thirdweb Smart Wallets](https://portal.thirdweb.com/wallets/smart-wallet)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
