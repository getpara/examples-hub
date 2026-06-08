# Para Pregen Claim

A Next.js example showing a UUID-to-email pregen wallet claim flow with post-claim private key export.

The app creates a pregen EVM wallet with a random `customId` UUID, encrypts and stores the user share with an app-owned email mapping, then upgrades the Para pregen identifier from UUID to email during authentication so the SDK can preload and claim the wallet.

## What This Example Shows

- Creating a pregen EVM wallet with `@getpara/server-sdk`
- Storing an encrypted user share in SQLite for a local demo backend
- Providing `fetchPregenWalletsOverride` to the React SDK Lite provider
- Claiming the pregen wallet during Para authentication
- Exporting the claimed wallet private key after the connected wallet matches the generated wallet
- Keeping flow logic in `usePregenClaimFlow` so the UI can be replaced by your app's components

## Setup

Create `.env` in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
ENCRYPTION_KEY=your_32_character_encryption_key
```

Generate a local encryption key:

```bash
openssl rand -base64 24 | head -c 32
```

Configure the project used by that API key in the Para Developer Portal:

- App name and display identity
- Branding, logo, and modal presentation
- Email authentication
- EVM wallet support
- Private key export settings appropriate for your project

Install and run the production build locally:

```bash
yarn install
yarn build
yarn start
```

For development:

```bash
yarn dev
```

## Flow

1. Enter the future claimant email.
2. The app creates a pregen EVM wallet with `pregenId: { customId: randomUUID() }`.
3. The app stores the encrypted user share, wallet ID, wallet address, UUID, and email mapping in SQLite.
4. Click `Begin claim`.
5. Para auth calls `fetchPregenWalletsOverride` with the authenticating email.
6. `/api/wallet/share` updates the pregen wallet identifier to `pregenId: { email }`, decrypts the share, and returns it.
7. The SDK preloads the user share and completes the claim during authentication.
8. After the claimed wallet is connected, click `Export private key` to open the Para export flow for that wallet.

## Key Files

```text
src/app/page.tsx                                   # Server page metadata and entry
src/components/ParaProvider.tsx                    # Para SDK Lite provider with pregen override
src/components/pregen/PregenClaimContainer.tsx     # Client orchestration
src/hooks/usePregenClaimFlow.ts                    # Copyable claim and export flow logic
src/lib/para/pregenClaimService.ts                 # Pregen generation and identifier upgrade logic
src/lib/para/fetchPregenWalletsOverride.ts         # SDK pregen wallet share callback
src/app/api/wallet/generate/route.ts               # Local demo API for pregen generation
src/app/api/wallet/share/route.ts                  # Local demo API for share retrieval
src/lib/db/keySharesDB.ts                          # SQLite demo storage
src/components/pregen/panels/*                     # Replaceable example UI
```

## Dependency Notes

This example uses `@getpara/react-sdk-lite@3.0.0` and `@getpara/server-sdk@3.0.0`. Some Para package `latest` tags still point at the v2 line, so the manifest intentionally keeps the v3 versions instead of downgrading to the registry `latest` tag.

The app intentionally uses `@getpara/react-sdk-lite` instead of the catch-all `@getpara/react-sdk` because this flow only needs the Para modal, core wallet hooks, and pregen claim override. That keeps unused account-abstraction, wallet connector, Cosmos, Solana, Stellar, Wagmi, and Ethers dependencies out of the example.

`viem` remains declared directly because the Para v3 SDK packages use it as a peer dependency.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js Documentation](https://nextjs.org/docs)
