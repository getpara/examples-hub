# Signer Solana web3.js

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-solana-web3.vercel.app)

This example demonstrates how to use Para with Solana's `@solana/web3.js` library in a Next.js app. It includes message signing, signature verification, balance reads, and a Devnet SOL transfer without Anchor.

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

Configure app identity, authentication methods, branding, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key. The `ParaProvider` in this example only handles API key/environment setup, Solana connector endpoint/network wiring, and runtime modal behavior.

`NEXT_PUBLIC_DEVNET_RPC_URL` is used by the Solana web3.js connection and Solana wallet connector wiring for this demo. It is not a Para provider config override.

## Core Integration

The copyable Para signer setup lives in `src/hooks/useParaSigner.ts`:

```tsx
import { useEffect, useState } from "react";
import { useAccount, useClient } from "@getpara/react-sdk-lite";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { useSolana } from "./useSolana";

export function useParaSigner() {
  const { isConnected } = useAccount();
  const client = useClient();
  const { connection } = useSolana();
  const [signer, setSigner] = useState<ParaSolanaWeb3Signer | null>(null);

  useEffect(() => {
    if (isConnected && connection && client) {
      setSigner(new ParaSolanaWeb3Signer(client, connection));
    } else {
      setSigner(null);
    }
  }, [isConnected, connection, client]);

  return {
    signer,
    connection,
    isReady: Boolean(signer && isConnected),
    address: signer?.sender?.toBase58() ?? null,
  };
}
```

Message signing and transaction flows are intentionally kept in hooks so the app UI can be replaced without copying presentation code.

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK Lite provider and Solana connector configuration.
- `src/hooks/useSolanaWalletConnection.ts` - Para modal state and active Solana wallet selection.
- `src/hooks/useParaSigner.ts` - Para Solana web3.js signer setup.
- `src/hooks/useMessageSigning.ts` - Message signing and verification.
- `src/hooks/useSolTransfer.ts` - SOL transfer construction, signing, submission, and confirmation.
- `src/hooks/useBalance.ts` - Devnet SOL balance query.
- `src/components/demos/MessageSigningDemo.tsx` - Message signing UI.
- `src/components/demos/SolTransferDemo.tsx` - SOL transfer UI.

## Dependency Notes

This app uses `@getpara/react-sdk-lite@3.0.0` instead of the catch-all React SDK because it only needs Para modal/core hooks, Solana connector wiring, and `@getpara/solana-web3.js-v1-integration@3.0.0`. The web3.js integration peers on `@solana/web3.js`, so the example does not need the Solana v2 package family.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Next.js Documentation](https://nextjs.org/docs)
