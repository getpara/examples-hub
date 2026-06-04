# Signer Stellar SDK

This example demonstrates how to use the [Para SDK](https://docs.getpara.com) with the [Stellar SDK](https://stellar.github.io/js-stellar-sdk/) (v14) to sign Stellar transactions and Soroban authorization entries.

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Para API key from the Para Developer Portal:

```bash
cp .env.example .env.local
```

2. Install dependencies:

```bash
yarn install
```

3. Run the development server:

```bash
yarn dev
```

## Developer Portal Configuration

This example expects app identity, branding, theme, and authentication methods to be configured in the Para Developer Portal for the API key. The `ParaProvider` keeps only API key/environment and runtime modal behavior. Stellar testnet settings are fixed in code for this demo, and no WalletConnect, external wallet, logo, app name, theme, or RPC URL environment variables are required.

## Key Dependencies

- `@getpara/react-sdk` - React SDK for Para wallet integration
- `@getpara/stellar-sdk-v14-integration` - Stellar signer integration for Para
- `@stellar/stellar-sdk` - Stellar SDK for building and submitting transactions

## Key Files

- `src/hooks/useParaSigner.ts` - Main hook wrapping `useStellarSigner` from Para's React SDK
- `src/hooks/useXlmTransfer.ts` - Build, sign, and submit a classic Stellar payment
- `src/hooks/useSignAuthEntry.ts` - Sign a Soroban authorization entry
- `src/components/ParaProvider.tsx` - Para SDK provider configuration

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
