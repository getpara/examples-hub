# ZeroDev EIP-7702 Example

A minimal Next.js example demonstrating Para SDK integration with ZeroDev for EIP-7702 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating ZeroDev 7702 smart EOA accounts with Para as the signer
- Sending gas-sponsored transactions via ZeroDev's paymaster

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_ZERODEV_PROJECT_ID=your_zerodev_project_id
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **ZeroDev Project ID**: Get from [ZeroDev Dashboard](https://dashboard.zerodev.app)

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
│       ├── WalletInfo.tsx          # EOA + 7702 account display
│       └── SendTransaction.tsx     # Sponsored transaction UI
├── hooks/
│   ├── useSmartAccountClient.ts    # ZeroDev 7702 account setup
│   └── useSendUserOperation.ts     # Transaction sending hook
└── lib/
    └── zerodev.ts                  # ZeroDev configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createZeroDevPaymasterClient } from "@zerodev/sdk";
import { create7702KernelAccount, create7702KernelAccountClient } from "@zerodev/ecdsa-validator";
import { createPublicClient, http } from "viem";

// Get Viem account from Para SDK (handles signing internally, including signAuthorization)
const { viemAccount } = useViemAccount();

// Create public client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(PUBLIC_RPC),
});

// Create 7702 Kernel account - simpler than 4337, no validator plugins needed
const kernelAccount = await create7702KernelAccount(publicClient, {
  signer: viemAccount,
  entryPoint: ENTRY_POINT,
  kernelVersion: KERNEL_VERSION, // KERNEL_V3_3 for 7702
});

// Create paymaster and kernel client
const paymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(PAYMASTER_RPC),
});

const kernelClient = create7702KernelAccountClient({
  account: kernelAccount,
  chain: sepolia,
  bundlerTransport: http(BUNDLER_RPC),
  paymaster: paymasterClient,
  client: publicClient,
});

// Send sponsored transaction - no encodeCalls needed for 7702
const userOpHash = await kernelClient.sendUserOperation({
  calls: [{ to, data, value }],
});
const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
```

## Key Differences from EIP-4337

| Aspect         | EIP-4337                  | EIP-7702              |
| -------------- | ------------------------- | --------------------- |
| Account Setup  | Validator + plugins       | Direct signer         |
| Kernel Version | KERNEL_V3_1               | KERNEL_V3_3           |
| Sending Ops    | `encodeCalls()` required  | Pass `calls` directly |
| Address        | New smart account address | Same as EOA           |

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [ZeroDev Documentation](https://docs.zerodev.app)
- [ZeroDev 7702 Guide](https://docs.zerodev.app/sdk/advanced/eip-7702)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
