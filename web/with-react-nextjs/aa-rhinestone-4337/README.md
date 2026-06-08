# Rhinestone Account Abstraction Example

A minimal Next.js example showing how to use Para with Rhinestone to create an EIP-4337 global wallet.

## What This Example Shows

- Setting up `ParaProvider` for Para wallet authentication
- Creating a Para Viem account with `useParaViemAccount`
- Creating a Rhinestone account with the Para signer
- Fetching the Rhinestone portfolio for the global wallet
- Keeping Rhinestone logic separate from the example UI

## Setup

1. In the [Para Developer Portal](https://developer.getpara.com), configure the project used by your API key:

   - Set the app or project display name, for example `Rhinestone Account Abstraction Example`.
   - Configure Branding with your logo, light theme colors, font, and border radius.
   - Configure Auth with the email and phone login settings, OAuth providers, auth layout, and 2FA setting you want for this example.

2. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
RHINESTONE_API_KEY=your_rhinestone_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Install dependencies and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Getting API Keys

- **Para API Key**: Get one from the [Para Developer Portal](https://developer.getpara.com).
- **Rhinestone API Key**: Contact Rhinestone for orchestrator API access.

## Configuration Ownership

Persistent Para app identity, branding, and auth settings are owned by the Developer Portal for the API key used to run this example. The local `ParaProvider` keeps only runtime modal behavior, such as on-ramp test mode and recovery secret step handling. The Rhinestone API key remains a server-side environment variable because it authenticates the orchestrator proxy route.

## Project Structure

```
src/
├── app/
│   ├── api/orchestrator/[...path]/route.ts  # Rhinestone orchestrator proxy
│   ├── layout.tsx                           # Server layout and metadata
│   └── page.tsx                             # Example entry
├── components/
│   ├── ParaProvider.tsx                     # Para SDK provider setup
│   ├── Rhinestone4337Example.tsx            # Client orchestration
│   ├── layout/Header.tsx                    # Presentational header
│   └── ui/                                  # Presentational example UI
├── hooks/
│   └── useRhinestoneGlobalWallet.ts         # Copyable Rhinestone logic
└── lib/
    └── rhinestone.ts                        # Chain and token configuration
```

## Key Integration Pattern

The reusable logic lives in `src/hooks/useRhinestoneGlobalWallet.ts`. The UI components receive props only, so you can copy the hook into your app without copying this example's UI.

```typescript
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { RhinestoneSDK } from "@rhinestone/sdk";
import type { Account } from "viem";

export function useRhinestoneGlobalWallet() {
  const { viemAccount } = useParaViemAccount();
  const rhinestone = new RhinestoneSDK({
    apiKey: "proxy",
    endpointUrl: `${window.location.origin}/api/orchestrator`,
  });

  async function createGlobalWallet() {
    if (!viemAccount) {
      throw new Error("Connect a Para wallet first.");
    }

    const account = await rhinestone.createAccount({
      owners: {
        type: "ecdsa",
        accounts: [viemAccount as Account],
      },
    });

    return {
      address: account.getAddress(),
      portfolio: await account.getPortfolio(),
    };
  }

  return { createGlobalWallet };
}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Rhinestone Documentation](https://docs.rhinestone.dev)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
