# Porto EIP-7702 Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-porto-7702.vercel.app)

A minimal Next.js example showing how to use Para with Porto to upgrade an EOA in place with EIP-7702.

## What This Example Shows

- Setting up `ParaProvider` for Para wallet authentication
- Creating a Para Viem account with `useParaViemAccount`
- Signing raw Porto authorization hashes with the Para Viem account
- Upgrading the connected EOA with `RelayActions.upgradeAccount`
- Keeping Porto logic separate from the example UI

## Setup

1. In the [Para Developer Portal](https://developer.getpara.com), configure the project used by your API key:

   - Set the app or project display name, for example `Porto EIP-7702 Example`.
   - Configure Branding with your logo, light theme colors, font, and border radius.
   - Configure Auth with the email and phone login settings, OAuth providers, auth layout, and 2FA setting you want for this example.

2. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

3. Install dependencies and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Getting API Keys

- **Para API Key**: Get one from the [Para Developer Portal](https://developer.getpara.com).

## Para Configuration Ownership

Persistent Para app identity, branding, and auth settings are owned by the Developer Portal for the API key used to run this example. The local `ParaProvider` keeps only runtime modal behavior, such as on-ramp test mode and recovery secret step handling. Porto-specific settings, including the Base Sepolia chain and Porto relay endpoint, remain in code because they are required by this EIP-7702 example.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                         # Server layout and metadata
│   └── page.tsx                           # Example entry
├── components/
│   ├── ParaProvider.tsx                   # Para SDK provider setup
│   ├── Porto7702Example.tsx               # Client orchestration
│   ├── layout/Header.tsx                  # Presentational header
│   └── ui/                                # Presentational example UI
├── hooks/
│   └── usePorto7702Account.ts             # Copyable Porto EIP-7702 logic
└── lib/
    └── porto.ts                           # Porto chain and relay configuration
```

## Key Integration Pattern

The reusable logic lives in `src/hooks/usePorto7702Account.ts`. The UI components receive props only, so you can copy the hook into your app without copying this example's UI.

```typescript
import { useParaViemAccount } from "@getpara/react-sdk/evm";
import { Account, Key, RelayActions } from "porto/viem";
import { createClient, http, type Hex } from "viem";
import { Chains } from "porto";

const portoClient = createClient({
  chain: Chains.baseSepolia,
  transport: http("https://rpc.porto.sh"),
});

export function usePorto7702Account() {
  const { viemAccount } = useParaViemAccount();

  async function upgradeToPorto() {
    if (!viemAccount?.address) {
      throw new Error("Connect a Para EOA before upgrading.");
    }

    const account = Account.from({
      address: viemAccount.address,
      async sign({ hash }) {
        return viemAccount.sign({ hash: hash as Hex });
      },
    });
    const adminKey = Key.createSecp256k1({ role: "admin" });

    return RelayActions.upgradeAccount(portoClient, {
      account,
      authorizeKeys: [adminKey],
    });
  }

  return { upgradeToPorto };
}
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Porto Documentation](https://porto.sh/sdk)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
