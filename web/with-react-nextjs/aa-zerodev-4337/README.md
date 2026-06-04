# ZeroDev Account Abstraction Example

A minimal Next.js example demonstrating Para SDK integration with ZeroDev for EIP-4337 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating ZeroDev Kernel smart accounts with Para as the signer
- Sending gas-sponsored UserOperations via ZeroDev's paymaster

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

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The ZeroDev project ID remains an environment variable because it configures ZeroDev Kernel account and paymaster behavior for this example, not Para Portal settings.

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
│   ├── useSmartAccountClient.ts    # ZeroDev Kernel account setup
│   └── useSendUserOperation.ts     # Transaction sending hook
└── lib/
    └── zerodev.ts                  # ZeroDev configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createWalletClient, createPublicClient, http } from "viem";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create wallet and public clients
const walletClient = createWalletClient({
  account: viemAccount,
  chain: sepolia,
  transport: http(PUBLIC_RPC),
});

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(PUBLIC_RPC),
});

// Create ECDSA validator with Para signer
const ecdsaValidator = await signerToEcdsaValidator(walletClient, {
  signer: viemAccount,
  entryPoint: ENTRY_POINT,
  kernelVersion: KERNEL_VERSION,
});

// Create Kernel account
const kernelAccount = await createKernelAccount(publicClient, {
  plugins: { sudo: ecdsaValidator },
  entryPoint: ENTRY_POINT,
  kernelVersion: KERNEL_VERSION,
});

// Create paymaster and kernel client
const paymasterClient = createZeroDevPaymasterClient({
  chain: sepolia,
  transport: http(PAYMASTER_RPC),
});

const kernelClient = createKernelAccountClient({
  account: kernelAccount,
  chain: sepolia,
  bundlerTransport: http(BUNDLER_RPC),
  paymaster: {
    getPaymasterData: (userOperation) => paymasterClient.sponsorUserOperation({ userOperation }),
  },
});

// Send sponsored UserOperation
const userOpHash = await kernelClient.sendUserOperation({
  callData: await kernelAccount.encodeCalls([{ to, data, value }]),
});
const receipt = await kernelClient.waitForUserOperationReceipt({ hash: userOpHash });
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [ZeroDev Documentation](https://docs.zerodev.app)
- [ZeroDev Kernel](https://docs.zerodev.app/sdk/core-api/create-account)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
