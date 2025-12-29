# Gelato EIP-7702 Example

A minimal Next.js example demonstrating Para SDK integration with Gelato for EIP-7702 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating Gelato smart accounts with EIP-7702 using Para as the signer
- Sending gas-sponsored transactions via Gelato's relay infrastructure

## EIP-7702 vs EIP-4337

| Feature | EIP-4337 | EIP-7702 |
|---------|----------|----------|
| Account type | Separate smart contract | EOA upgraded in-place |
| Address | New address | Same as EOA |
| Deployment | Requires factory | No deployment needed |
| Gas efficiency | Higher overhead | Lower overhead |

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_GELATO_API_KEY=your_gelato_api_key
```

2. Install dependencies and run:

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
│       ├── WalletInfo.tsx          # Upgraded EOA display
│       └── SendTransaction.tsx     # Sponsored transaction UI
├── hooks/
│   ├── useSmartAccountClient.ts    # Gelato 7702 account setup
│   └── useSendUserOperation.ts     # Transaction sending hook
└── lib/
    └── gelato.ts                   # Gelato configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { gelato, createGelatoSmartWalletClient } from "@gelatonetwork/smartwallet";
import { createWalletClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create public client for chain interaction
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Create Gelato account (EIP-7702)
// The smart account address is the same as the EOA address
const smartAccount = await gelato({
  owner: viemAccount,
  client: publicClient,
});

// Create wallet client with Gelato account
const walletClient = createWalletClient({
  account: smartAccount,
  chain: sepolia,
  transport: http(),
});

// Create Gelato smart wallet client
const smartWalletClient = await createGelatoSmartWalletClient(walletClient, {
  apiKey: GELATO_API_KEY,
});

// Send sponsored transaction
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
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
