# Para Pregen Claim

This Next.js example shows a UUID-to-email pregen wallet claim flow with post-claim private key export.

The app first creates a pregen EVM wallet with a random `customId` UUID. It encrypts and stores the user share with an internal email mapping. When the user starts the claim flow, the Para provider callback asks the app backend for the share. The backend updates the Para pregen wallet identifier from the UUID to the authenticating email, decrypts the share, and returns it so the SDK can preload and claim the wallet during auth.

## Setup

Create `.env` or `.env.local` in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your-para-api-key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
ENCRYPTION_KEY=your-32-character-encryption-key
```

Generate an encryption key:

```bash
openssl rand -base64 24 | head -c 32
```

Install dependencies:

```bash
yarn install
```

Run locally:

```bash
yarn dev
```

## Flow

1. Enter the future claimant email.
2. The app creates a pregen wallet with `pregenId: { customId: randomUUID() }`.
3. The app stores the encrypted user share, wallet ID, wallet address, UUID, and email mapping in SQLite.
4. Click **Begin claim**.
5. Para auth calls `fetchPregenWalletsOverride` with the authenticating email.
6. `/api/wallet/share` updates the pregen wallet identifier to `pregenId: { email }`, decrypts the share, and returns it.
7. The SDK preloads the user share and completes the claim during authentication.
8. After the claimed wallet is connected, click **Export private key** to open the Para export flow for that wallet.
