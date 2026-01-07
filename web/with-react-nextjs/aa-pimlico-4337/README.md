# Pimlico Account Abstraction Example

A minimal Next.js example demonstrating Para SDK integration with Pimlico's permissionless.js for EIP-4337 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating smart accounts with Para as the signer using permissionless.js
- Sending gas-sponsored UserOperations via Pimlico's paymaster

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
NEXT_PUBLIC_PIMLICO_SPONSORSHIP_POLICY_ID=your_sponsorship_policy_id
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Pimlico API Key**: Get from [Pimlico Dashboard](https://dashboard.pimlico.io)
- **Sponsorship Policy ID**: Create a sponsorship policy in your [Pimlico Dashboard](https://dashboard.pimlico.io/sponsorship-policies)

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
│   ├── useSmartAccountClient.ts    # Pimlico smart account setup
│   └── useSendUserOperation.ts     # User operation sending hook
└── lib/
    └── pimlico.ts                  # Pimlico configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createPublicClient, http } from "viem";
import { entryPoint07Address } from "viem/account-abstraction";
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create public client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Create smart account from Para's viemAccount
const smartAccount = await toSimpleSmartAccount({
  client: publicClient,
  owner: viemAccount,
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
});

// Create paymaster client for gas sponsorship
const paymasterClient = createPimlicoClient({
  chain: sepolia,
  transport: http(PIMLICO_RPC_URL),
  entryPoint: {
    address: entryPoint07Address,
    version: "0.7",
  },
});

// Create smart account client with sponsorship policy
const smartAccountClient = createSmartAccountClient({
  account: smartAccount,
  chain: sepolia,
  bundlerTransport: http(PIMLICO_RPC_URL),
  paymaster: paymasterClient,
  paymasterContext: {
    sponsorshipPolicyId: SPONSORSHIP_POLICY_ID,
  },
  userOperation: {
    estimateFeesPerGas: async () =>
      (await paymasterClient.getUserOperationGasPrice()).fast,
  },
});

// Send sponsored transaction
const txHash = await smartAccountClient.sendTransaction({
  to: "0x...",
  data: "0x",
  value: BigInt(0),
});
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Pimlico Documentation](https://docs.pimlico.io)
- [Permissionless.js Documentation](https://docs.pimlico.io/permissionless)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
