# Alchemy EIP-7702 Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-alchemy-7702.vercel.app)

A minimal Next.js example showing how to use Para with Alchemy Account Kit to delegate smart account behavior to an EOA with EIP-7702 and send a gas-sponsored transaction.

## What This Example Shows

- Configuring `ParaProvider` for Para authentication
- Creating an Alchemy EIP-7702 account with `useAlchemySmartAccount`
- Sending a sponsored transaction with React `useState` state management
- Keeping the reusable EIP-7702 logic separate from the example UI

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

2. Install dependencies:

```bash
yarn install
```

3. Build and start the app:

```bash
yarn build
yarn start
```

4. Open `http://127.0.0.1:3000`.

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Alchemy API Key**: Get from [Alchemy Dashboard](https://dashboard.alchemy.com)
- **Alchemy Gas Policy ID**: Create a gas policy in your Alchemy Dashboard under "Gas Manager"

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The Alchemy API key and gas policy ID remain environment variables because they configure Alchemy Account Kit and gas sponsorship for this example, not Para Portal settings.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx                            # Root layout, font, and global styles
│   └── page.tsx                              # Server page metadata and app entry
├── components/
│   ├── Alchemy7702Example.tsx                # ParaProvider plus client SDK hook orchestration
│   ├── ParaProvider.tsx                      # Para SDK provider setup
│   ├── layout/Header.tsx                     # Presentational header
│   └── ui/
│       ├── ConnectCard.tsx                   # Presentational connect card
│       ├── WalletInfo.tsx                    # Presentational EOA delegation display
│       └── SendTransaction.tsx               # Presentational sponsored transaction UI
├── hooks/
│   └── useAlchemy7702SponsoredTransaction.ts # Copyable EIP-7702 logic
└── lib/
    └── alchemy.ts                            # Alchemy configuration
```

## Key Integration Pattern

The reusable logic lives in `src/hooks/useAlchemy7702SponsoredTransaction.ts`. The UI components receive props only, so you can copy the hook into your app without copying this example's UI.

```tsx
import { useCallback, useState } from "react";
import { useAlchemySmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";
import { sepolia } from "viem/chains";

const TARGET_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

export function useSponsored7702Transaction() {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const { smartAccount, isLoading, error } = useAlchemySmartAccount({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "",
    chain: sepolia,
    gasPolicyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_POLICY_ID ?? "",
    mode: "7702",
  });

  const sendSponsoredTransaction = useCallback(async () => {
    if (!smartAccount) return;

    setIsSendingTransaction(true);
    setTransactionError(null);
    setTransactionHash(null);

    try {
      const receipt = await smartAccount.sendTransaction({ to: TARGET_ADDRESS });
      setTransactionHash(receipt.transactionHash);
    } catch (cause) {
      setTransactionError(cause instanceof Error ? cause : new Error("Transaction failed."));
    } finally {
      setIsSendingTransaction(false);
    }
  }, [smartAccount]);

  return {
    delegatedAccountAddress: smartAccount?.smartAccountAddress ?? null,
    transactionHash,
    transactionError,
    accountError: error,
    isAccountLoading: isLoading,
    isSendingTransaction,
    canSendTransaction: Boolean(smartAccount) && !isSendingTransaction,
    sendSponsoredTransaction,
  };
}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Alchemy Account Kit Documentation](https://docs.alchemy.com/docs/account-kit-overview)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
