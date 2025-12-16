# Alchemy EIP-7702 Example

A minimal Next.js example demonstrating Para SDK integration with Alchemy Account Kit using EIP-7702 for gas-sponsored transactions.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Upgrading EOA with smart account capabilities via EIP-7702
- Sending gas-sponsored UserOperations via Alchemy's paymaster

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
│   ├── useSmartAccountClient.ts    # Alchemy 7702 client setup
│   └── useSendUserOperation.ts     # Transaction mutation hook
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

// Get Viem account from Para SDK
const { viemAccount } = useViemAccount();

// Create wallet client and wrap as signer
const walletClient = createWalletClient({
  account: viemAccount,
  chain: sepolia,
  transport: http(),
});
const signer = new WalletClientSigner(walletClient, "para");

// Create Alchemy client with 7702 mode
const client = await createModularAccountV2Client({
  mode: "7702",
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
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
