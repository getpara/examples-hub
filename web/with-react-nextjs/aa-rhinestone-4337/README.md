# Rhinestone Global Wallet Example

A Next.js example demonstrating Para SDK integration with Rhinestone for EIP-4337 cross-chain global wallets. Users can deposit tokens on any supported chain and spend them on any other chain with a single account address.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating Rhinestone global wallets with Para as the signer
- Executing cross-chain transactions with automatic bridging

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
RHINESTONE_API_KEY=your_rhinestone_api_key
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Rhinestone API Key**: Contact Rhinestone team for access

## Project Structure

```
src/
├── app/
│   ├── api/orchestrator/[...path]/route.ts  # Rhinestone API proxy
│   ├── layout.tsx                            # Root layout with ParaProvider
│   └── page.tsx                              # Main page
├── components/
│   ├── ParaProvider.tsx                      # Para SDK provider setup
│   ├── MainContent.tsx                       # Transaction UI
│   ├── WalletSidebar.tsx                     # Wallet info sidebar
│   └── ui/                                   # UI components
├── hooks/
│   └── useGlobalWallet.ts                    # Rhinestone account hook
└── lib/
    └── rhinestone.ts                         # Rhinestone configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { RhinestoneSDK } from "@rhinestone/sdk";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create Rhinestone SDK instance (uses API proxy for auth)
const rhinestone = new RhinestoneSDK({
  apiKey: "proxy",
  endpointUrl: `${window.location.origin}/api/orchestrator`,
});

// Create global wallet with Para signer
const rhinestoneAccount = await rhinestone.createAccount({
  owners: {
    type: "ecdsa",
    accounts: [viemAccount],
  },
});

// Get global wallet address (same across all chains)
const globalAddress = rhinestoneAccount.getAddress();

// Execute cross-chain transaction
const transaction = await rhinestoneAccount.sendTransaction({
  sourceChains: [arbitrum],  // Look for tokens on Arbitrum
  targetChain: base,          // Execute on Base
  calls: [{ to, data, value }],
  tokenRequests: [{ address: usdcOnBase, amount: 5000000n }],
  sponsored: true,
});

await rhinestoneAccount.waitForExecution(transaction);
```

## Supported Chains

- Ethereum
- Arbitrum
- Base
- Polygon
- Optimism

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
