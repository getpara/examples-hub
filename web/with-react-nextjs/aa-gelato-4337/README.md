# Gelato Account Abstraction Example

A minimal Next.js example demonstrating Para SDK integration with Gelato for EIP-4337 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating Gelato Kernel smart accounts with Para as the signer
- Sending gas-sponsored UserOperations via Gelato's relay infrastructure

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_GELATO_API_KEY=your_gelato_api_key
```

2. Configure the API key in the Para Developer Portal:

- Set the app or project display name, for example `Gelato AA Example`.
- Configure Branding for the logo, light theme, primary interactive color, font, and border radius.
- Configure Auth for the enabled OAuth providers, email and phone login toggles, 2FA setting, and auth layout.

3. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Gelato API Key**: Get from [Gelato Dashboard](https://app.gelato.network)

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
│   ├── useSmartAccountClient.ts    # Gelato Kernel account setup
│   └── useSendUserOperation.ts     # User operation sending logic
└── lib/
    └── gelato.ts                   # Gelato configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { accounts, createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { createWalletClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create public client for chain interaction
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Create Kernel account (ERC-4337)
const kernelAccount = await accounts.kernel({
  owner: viemAccount,
  client: publicClient,
  index: BigInt(0),
  eip7702: false,
});

// Create wallet client with Kernel account
const walletClient = createWalletClient({
  account: kernelAccount,
  chain: sepolia,
  transport: http(),
});

// Create Gelato smart wallet client
const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
  apiKey: GELATO_API_KEY,
});

// Send sponsored UserOperation
const result = await smartWalletClient.execute({
  payment: { type: "sponsored" },
  calls: [
    {
      to: "0x...",
      data: "0x",
      value: BigInt(0),
    },
  ],
});

const txHash = await result.wait();
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Gelato Documentation](https://docs.gelato.network)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
