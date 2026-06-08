# Signer Stellar SDK

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-stellar-sdk.vercel.app)

This example demonstrates how to use Para with the Stellar SDK v14 in a Next.js app. It includes message signing, signature verification, Stellar Testnet balance reads, Friendbot funding, XLM transfers, and Soroban authorization entry signing.

## Setup

Create a `.env` file in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Install and run the production build:

```bash
yarn install
yarn build
yarn start --hostname 127.0.0.1 --port 3000
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, and wallet visibility in the Para Developer Portal for the API key. The `ParaProvider` in this example only handles API key/environment setup and runtime modal behavior. Stellar Testnet Horizon, Friendbot, and explorer URLs are fixed in `src/config/constants.ts` for this demo.

## Core Integration

The copyable Para signer setup lives in `src/hooks/useParaSigner.ts`:

```tsx
import { useAccount } from "@getpara/react-sdk-lite";
import { useParaStellarSigner } from "@getpara/react-sdk-lite/chains/stellar";
import { Horizon, Networks } from "@stellar/stellar-sdk";
import { TESTNET_HORIZON_URL } from "@/config/constants";

const server = new Horizon.Server(TESTNET_HORIZON_URL);

export function useParaSigner() {
  const { isConnected } = useAccount();
  const { stellarSigner, isLoading } = useParaStellarSigner({
    networkPassphrase: Networks.TESTNET,
  });

  return {
    signer: stellarSigner,
    server,
    isReady: Boolean(stellarSigner && isConnected && !isLoading),
    isLoading,
    address: stellarSigner?.address ?? null,
  };
}
```

Message signing, transaction submission, Friendbot funding, balance reads, and auth-entry signing are intentionally kept in hooks so the app UI can be replaced without copying presentation code.

## Key Files

- `src/components/ParaProvider.tsx` - SDK Lite provider configuration.
- `src/hooks/useStellarWalletConnection.ts` - Para modal state and active Stellar wallet selection.
- `src/hooks/useParaSigner.ts` - Para Stellar signer setup.
- `src/hooks/useMessageSigning.ts` - Message signing and Ed25519 verification.
- `src/hooks/useXlmTransfer.ts` - XLM transfer construction, signing, submission, and confirmation.
- `src/hooks/useFriendbot.ts` - Stellar Testnet Friendbot funding.
- `src/hooks/useBalance.ts` - Stellar Testnet balance query.
- `src/hooks/useSignAuthEntry.ts` - Soroban auth-entry signing.
- `src/components/demos/SignMessageDemo.tsx` - Message signing UI.
- `src/components/demos/XlmTransferDemo.tsx` - XLM transfer UI.
- `src/components/demos/SignAuthEntryDemo.tsx` - Auth-entry signing UI.

## Dependency Notes

This app uses `@getpara/react-sdk-lite@3.0.0` instead of the catch-all React SDK because it only needs Para modal/core hooks and `@getpara/stellar-sdk-v14-integration@3.0.0`. The Stellar integration peers on `@stellar/stellar-sdk@^14.0.0`, so this example uses the newest compatible v14 release, `@stellar/stellar-sdk@14.6.1`, rather than the incompatible v15 line.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [Next.js Documentation](https://nextjs.org/docs)
