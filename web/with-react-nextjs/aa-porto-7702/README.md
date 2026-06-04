# Porto EIP-7702 Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-porto-7702.vercel.app)

A minimal Next.js example demonstrating Para SDK integration with Porto for EIP-7702 account upgrades. This allows Para EOA wallets to be upgraded to smart accounts while preserving the original wallet address.

## What This Example Shows

- Setting up `ParaProvider` for Para SDK authentication
- Using `useViemAccount` hook from `@getpara/react-sdk/evm` for the Viem signer
- Upgrading EOA to Porto smart account via EIP-7702
- Using session keys for gasless transactions

## EIP-7702 vs EIP-4337

| Feature | EIP-4337 | EIP-7702 |
|---------|----------|----------|
| Account type | Separate smart contract | EOA upgraded in-place |
| Address | New address | Same as EOA |
| Deployment | Requires factory | No deployment needed |
| Gas efficiency | Higher overhead | Lower overhead |

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

3. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)

## Para Configuration Ownership

Persistent Para app identity, branding, and auth settings are owned by the Developer Portal for the API key used to run this example. The local `ParaProvider` keeps only runtime modal behavior, such as on-ramp test mode and recovery secret step handling. Porto-specific account upgrade settings, including the Base Sepolia chain and Porto relay endpoint, remain in code because they are required by this EIP-7702 example.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout with ParaProvider
│   └── page.tsx                    # Main page with upgrade demo
├── components/
│   ├── ParaProvider.tsx            # Para SDK provider setup
│   ├── layout/Header.tsx           # Header with connect button
│   └── PortoDemo.tsx               # EOA vs Smart Account comparison
├── hooks/
│   └── usePortoAccount.ts          # Porto upgrade and account hook
└── lib/
    └── porto.ts                    # Porto configuration
```

## Key Integration Pattern

```typescript
import { useViemAccount } from "@getpara/react-sdk/evm";
import { Chains, Account, Key, RelayActions } from "porto/viem";
import { createClient, http, type Hex } from "viem";

// Get Viem account from Para SDK (handles signing internally)
const { viemAccount } = useViemAccount();

// Create Porto client for Base Sepolia
const portoClient = createClient({
  chain: Chains.baseSepolia,
  transport: http("https://rpc.porto.sh"),
});

// Porto requires raw hash signing (no EIP-191 prefix)
const signRawHash = async (hash: Hex): Promise<Hex> => {
  return viemAccount.sign({ hash });
};

// Create account wrapper with raw signing
const customAccount = Account.from({
  address: viemAccount.address,
  async sign({ hash }) {
    return signRawHash(hash as Hex);
  },
});

// Generate admin key and prepare upgrade
const adminKey = Key.createSecp256k1({ role: "admin" });
const prepared = await RelayActions.prepareUpgradeAccount(portoClient, {
  address: customAccount.address,
  authorizeKeys: [adminKey],
});

// Sign both authorization and execution digests
const signatures = {
  auth: await signRawHash(prepared.digests.auth as Hex),
  exec: await signRawHash(prepared.digests.exec as Hex),
};

// Upgrade account to Porto smart account
const upgradedAccount = await RelayActions.upgradeAccount(portoClient, {
  ...prepared,
  signatures,
});

// Now you can use session keys, batch transactions, etc.
```

## Important Notes

- Porto requires raw hash signing (no EIP-191 prefix) - uses `viemAccount.sign({ hash })` directly
- The smart account address remains the same as the original EOA
- Currently supports Base Sepolia testnet
- Uses Porto relay endpoint: `https://rpc.porto.sh`

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Porto Documentation](https://porto.sh/sdk)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
