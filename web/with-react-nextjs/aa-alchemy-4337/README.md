# Alchemy Account Abstraction Example

A minimal Next.js example demonstrating Para SDK integration with Alchemy Account Kit for EIP-4337 gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Creating Alchemy modular smart accounts with Para as the signer
- Sending gas-sponsored UserOperations via Alchemy's paymaster

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID=your_gas_policy_id
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Alchemy API Key**: Get from [Alchemy Dashboard](https://dashboard.alchemy.com)
- **Alchemy Gas Policy ID**: Create a gas policy in your Alchemy Dashboard under "Gas Manager"

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The Alchemy API key and gas policy ID remain environment variables because they configure Alchemy Account Kit and gas sponsorship for this example, not Para Portal settings.

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
│   └── useAlchemySmartAccount.ts   # Alchemy modular account setup
└── lib/
    └── alchemy.ts                  # Alchemy configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { createModularAccountV2Client } from "@account-kit/smart-contracts";
import { alchemy, sepolia } from "@account-kit/infra";
import { WalletClientSigner } from "@aa-sdk/core";
import { createWalletClient, http } from "viem";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create wallet client and wrap as signer for Alchemy SDK
const walletClient = createWalletClient({
  account: viemAccount,
  chain: sepolia,
  transport: http(),
});
const signer = new WalletClientSigner(walletClient, "para");

// Create Alchemy modular account with gas sponsorship
const client = await createModularAccountV2Client({
  transport: alchemy({ apiKey: ALCHEMY_API_KEY }),
  chain: sepolia,
  signer,
  policyId: GAS_POLICY_ID,
});

// Send sponsored UserOperation
const userOpHash = await client.sendUserOperation({
  uo: { target: "0x...", data: "0x", value: BigInt(0) },
});
const txHash = await client.waitForUserOperationTransaction(userOpHash);
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Alchemy Account Kit Documentation](https://docs.alchemy.com/docs/account-kit-overview)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
