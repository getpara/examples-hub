# Para SDK Solana Anchor Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-anchor.vercel.app)

This Next.js app demonstrates how to use Para with Solana web3.js and Anchor on Devnet. It includes message signing, SOL transfers, Token-2022 mint creation, and Token-2022 minting through a sample Anchor program.

## Setup

Create a `.env` file in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

Install dependencies and build the production app:

```bash
yarn install
yarn build
yarn start --hostname 127.0.0.1 --port 3000
```

`NEXT_PUBLIC_PARA_API_KEY` selects the Developer Portal project used by the app. `NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA` when omitted and can be set to `SANDBOX` or `PROD` when using keys from those environments. `NEXT_PUBLIC_DEVNET_RPC_URL` is used by the local Solana connection.

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, wallet visibility, Solana external wallet availability, and linked embedded wallet behavior in the Para Developer Portal for the API key used by this example. This app does not set `configOverrides`; persistent project settings should come from the Developer Portal. `ParaProvider` keeps only API key/environment wiring, Solana connector setup, and runtime modal flags.

## Key Dependencies

- `@getpara/react-sdk-lite@3.0.0` provides the Para provider, modal, and hooks without pulling in every chain-specific integration.
- `@getpara/solana-web3.js-v1-integration@3.0.0` creates the Solana web3.js signer used by the Anchor provider.
- `@getpara/solana-wallet-connectors@3.0.0`, Solana wallet adapter packages, and `@farcaster/mini-app-solana@1.1.3` support the Solana external wallet connector.
- `@coral-xyz/anchor@0.32.1`, `@solana/web3.js@1.98.4`, and `@solana/spl-token@0.4.14` support the Solana and Anchor demo logic.
- `bs58@6.0.0`, `buffer@6.0.3`, and `tweetnacl@1.0.3` support message signature display and verification.
- `next@16.2.7`, `react@19.2.7`, and `react-dom@19.2.7` run the app.

## Core Signer Logic

The copyable Para and Anchor setup lives in `src/hooks/useParaSigner.ts`:

```ts
const signer = new ParaSolanaWeb3Signer(client, connection);

const provider = new anchor.AnchorProvider(
  connection,
  {
    publicKey: signer.sender,
    signTransaction: (transaction) => signer.signTransaction(transaction),
    signAllTransactions: (transactions) => Promise.all(transactions.map((transaction) => signer.signTransaction(transaction))),
    signMessage: (message) => signer.signBytes(Buffer.from(message)),
  },
  { commitment: connection.commitment || "confirmed" }
);
```

The demo UI consumes this hook through route-specific hooks such as `useMessageSigning`, `useSolTransfer`, `useCreateToken`, and `useMintToken`.

## Key Files

- `src/components/ParaProvider.tsx` wires the Para provider, API key/environment, and Devnet Solana connector.
- `src/components/SolanaAnchorApp.tsx` mounts the SDK provider and connected header for hydrated routes.
- `src/components/SolanaAnchorPreview.tsx` server-renders the first screen so the app has visible initial HTML before hydration.
- `src/hooks/useParaSigner.ts` creates the `ParaSolanaWeb3Signer` and Anchor provider.
- `src/hooks/useSolana.ts` creates the Solana Devnet connection.
- `src/hooks/use*.ts` contain the copyable signing, transfer, and Anchor program logic.
- `src/components/demos/*` contains the example UI that consumes the hooks.
- `src/app/*/page.tsx` contains server route wrappers and metadata.
- `src/idl/transfer_tokens.ts` and `src/idl/transfer_tokens.json` define the sample Anchor program interface.
- `programs/transfer_tokens/src/lib.rs` is the sample Anchor program source.

## Anchor Program Commands

```bash
yarn anchor:build
yarn anchor:deploy
yarn anchor:verify
```

The deployed program id used by the app is defined in `src/config/constants.ts`.

## Validation

```bash
yarn install
yarn install --immutable
yarn typecheck
yarn lint
rm -rf .next && yarn build
npx -y react-doctor@latest . --verbose --diff
yarn start --hostname 127.0.0.1 --port 3000
```

The production server should return HTTP 200 at `http://127.0.0.1:3000`, and the UI should render the selector page plus nested demo routes.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [Next.js Documentation](https://nextjs.org/docs)
