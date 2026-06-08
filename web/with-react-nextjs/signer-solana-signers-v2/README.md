# Signer Solana Signers v2

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-signers-v2.vercel.app)

This example demonstrates how to use Para with Solana's v2 signer interfaces in a Next.js app. It includes message signing, signature verification, balance reads, and a Devnet SOL transfer.

## Setup

Create a `.env` file in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_DEVNET_RPC_URL=https://api.devnet.solana.com
```

Install and run the production build:

```bash
yarn install
yarn build
yarn start --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Developer Portal Configuration

Configure app identity, authentication methods, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key. The `ParaProvider` in this example only handles the API key/environment, Solana external wallet connector wiring, and modal runtime options.

`NEXT_PUBLIC_DEVNET_RPC_URL` is used by the example's Solana RPC clients for balance, transaction, and signer operations. It is not a Para provider config override.

## Core Integration

The copyable Para signer setup lives in `src/hooks/useParaSigner.ts`:

```tsx
import { useAccount } from "@getpara/react-sdk-lite";
import { useParaSolanaSigner } from "@getpara/react-sdk-lite/chains/solana";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const account = useAccount();
  const { rpc, paraRpc } = useSolana();
  const { solanaSigner, isLoading } = useParaSolanaSigner({ rpc: paraRpc });

  return {
    signer: solanaSigner,
    rpc,
    isLoading,
    isReady: Boolean(solanaSigner && account?.isConnected && !isLoading),
    address: solanaSigner?.address?.toString() ?? null,
  };
}
```

`src/hooks/useSolana.ts` creates both RPC clients used by the app:

- `@solana/kit` RPC for balance, transaction construction, send, and confirmation helpers.
- `@solana/rpc-spec` RPC for Para's Solana Signers v2 hook.

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK Lite provider and Solana connector configuration.
- `src/hooks/useSolanaWalletConnection.ts` - Para modal state and active Solana wallet selection.
- `src/hooks/useParaSigner.ts` - Para Solana Signers v2 hook wrapper.
- `src/hooks/useMessageSigning.ts` - Message signing and verification.
- `src/hooks/useSolTransfer.ts` - SOL transfer construction, signing, submission, and confirmation.
- `src/hooks/useBalance.ts` - Devnet SOL balance query.
- `src/components/demos/MessageSigningDemo.tsx` - Message signing UI.
- `src/components/demos/SolTransferDemo.tsx` - SOL transfer UI.

## Dependency Notes

This app uses `@getpara/react-sdk-lite@3.0.0` instead of the catch-all React SDK because it only needs Para modal/core hooks plus the Solana chain subpath. `@getpara/solana-signers-v2-integration@3.0.0` currently peers on the Solana 2.x package line, so this example pins Solana v2 packages to the newest compatible `2.3.0` release instead of the registry-latest 6.x line.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com/)
- [Solana JavaScript SDK](https://github.com/solana-labs/solana-web3.js)
- [Next.js Documentation](https://nextjs.org/docs)
