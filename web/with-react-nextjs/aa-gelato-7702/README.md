# Gelato EIP-7702 Example

A minimal Next.js example showing how to use Para with Gelato to delegate smart account behavior to an EOA with EIP-7702 and send a gas-sponsored transaction.

## What This Example Shows

- Configuring `ParaProvider` for Para authentication
- Creating a Gelato EIP-7702 account with `useGelatoSmartAccount`
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
NEXT_PUBLIC_GELATO_API_KEY=your_gelato_api_key
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
- **Gelato API Key**: Get from [Gelato Dashboard](https://app.gelato.network)

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The Gelato API key remains an environment variable because it configures Gelato smart wallet sponsorship for this example, not Para Portal settings.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx                           # Root layout, font, and global styles
│   └── page.tsx                             # Server page metadata and app entry
├── components/
│   ├── Gelato7702Example.tsx                # ParaProvider plus client SDK hook orchestration
│   ├── ParaProvider.tsx                     # Para SDK provider setup
│   ├── layout/Header.tsx                    # Presentational header
│   └── ui/
│       ├── ConnectCard.tsx                  # Presentational connect card
│       ├── WalletInfo.tsx                   # Presentational EOA delegation display
│       └── SendTransaction.tsx              # Presentational sponsored transaction UI
├── hooks/
│   └── useGelato7702SponsoredTransaction.ts # Copyable Gelato EIP-7702 logic
└── lib/
    └── gelato.ts                            # Gelato configuration
```

## Key Integration Pattern

The reusable logic lives in `src/hooks/useGelato7702SponsoredTransaction.ts`. The UI components receive props only, so you can copy the hook into your app without copying this example's UI.

```tsx
import { useCallback, useState } from "react";
import { useGelatoSmartAccount } from "@getpara/react-sdk";
import type { Hash } from "viem";
import { sepolia } from "viem/chains";

const TARGET_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

export function useSponsoredGelato7702Transaction() {
  const [transactionHash, setTransactionHash] = useState<Hash | null>(null);
  const [transactionError, setTransactionError] = useState<Error | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);

  const { smartAccount, isLoading, error } = useGelatoSmartAccount({
    apiKey: process.env.NEXT_PUBLIC_GELATO_API_KEY ?? "",
    chain: sepolia,
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
- [Gelato Documentation](https://docs.gelato.network)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
