# Biconomy MEE (Multi-chain Execution Engine) Example

A minimal Next.js example demonstrating Para SDK integration with Biconomy's MEE for gas-abstracted USDC transfers on Base.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `@getpara/viem-v2-integration` to create a Para viem account
- Creating a Companion Smart Account (orchestrator) with Biconomy's abstractjs
- Executing gas-abstracted transfers where fees are paid in USDC instead of ETH
- Batching multiple transfers with a single signature using Fusion mode

## How Biconomy MEE Works

Biconomy MEE (Multi-chain Execution Engine) uses **Fusion mode** with a Companion Smart Account:

1. **Companion Smart Account (Orchestrator)**: A smart account that handles batching and gas abstraction
2. **Fusion Flow**: The orchestrator pulls tokens from your EOA wallet, executes batched transfers, and pays gas fees in USDC
3. **Single Signature**: All operations (token pull + transfers + fee payment) are authorized with one signature

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **WalletConnect Project ID**: Get from [WalletConnect Cloud](https://cloud.walletconnect.com)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout with ParaProvider
│   └── page.tsx                    # Main page with wallet + transfer UI
├── components/
│   ├── ParaProvider.tsx            # Para SDK provider setup
│   ├── layout/Header.tsx           # Header with connect button
│   └── ui/
│       ├── ConnectCard.tsx         # Connect wallet card
│       ├── WalletInfo.tsx          # Balance + MEE status display
│       └── TransferForm.tsx        # USDC transfer form
├── hooks/
│   ├── useMeeClient.ts             # Biconomy MEE client initialization
│   ├── useUsdcBalance.ts           # USDC balance fetching
│   └── useFusionTransfer.ts        # Fusion transfer execution
└── lib/
    └── biconomy.ts                 # Biconomy configuration constants
```

## Key Integration Pattern

```typescript
import Para, { Environment } from "@getpara/web-sdk";
import { createParaAccount } from "@getpara/viem-v2-integration";
import { http, erc20Abi, type Hex, type LocalAccount } from "viem";
import { base } from "viem/chains";
import {
  createMeeClient,
  toMultichainNexusAccount,
  getMeeScanLink,
  getMEEVersion,
  MEEVersion,
} from "@biconomy/abstractjs";

// Create Para client (shares session with React SDK)
const para = new Para(Environment.BETA, API_KEY);

// Create Para viem account
const viemParaAccount = await createParaAccount(para);

// Create Companion Smart Account (orchestrator)
const multiAccount = await toMultichainNexusAccount({
  chainConfigurations: [
    {
      chain: base,
      transport: http(),
      version: getMEEVersion(MEEVersion.V2_1_0),
    },
  ],
  signer: viemParaAccount as LocalAccount,
});

// Create MEE client
const meeClient = await createMeeClient({ account: multiAccount });

// Build transfer instructions
const transfers = await Promise.all(
  recipients.map((recipient) =>
    multiAccount.buildComposable({
      type: "default",
      data: {
        abi: erc20Abi,
        chainId: base.id,
        to: USDC_ADDRESS,
        functionName: "transfer",
        args: [recipient as Hex, transferAmount],
      },
    })
  )
);

// Execute with Fusion mode (gas paid in USDC)
const fusionQuote = await meeClient.getFusionQuote({
  instructions: transfers,
  trigger: {
    chainId: base.id,
    tokenAddress: USDC_ADDRESS,
    amount: totalAmount,
  },
  feeToken: {
    address: USDC_ADDRESS,
    chainId: base.id,
  },
  simulation: { simulate: true },
});

const { hash } = await meeClient.executeFusionQuote({ fusionQuote });
const receipt = await meeClient.waitForSupertransactionReceipt({ hash });

// View transaction on MEE Scan
const meeScanLink = getMeeScanLink(hash);
```

## Features

- **Gas Abstraction**: Pay transaction fees in USDC instead of ETH
- **Batched Transfers**: Send to multiple recipients with one signature
- **Fusion Mode**: Seamless token pull + transfer + fee payment
- **MEE Scan**: Track supertransactions on Biconomy's explorer

## Network

This example operates on **Base Mainnet** and uses real USDC. Make sure your wallet has USDC on Base before testing transfers.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Biconomy Documentation](https://docs.biconomy.io)
- [Biconomy AbstractJS](https://github.com/bcnmy/abstractjs)
- [Base Network](https://base.org)

