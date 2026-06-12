# Safe Account Abstraction Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-safe-4337.vercel.app)

A minimal Next.js example that uses Para with Safe ERC-4337 account abstraction to send a gas-sponsored transaction on Sepolia.

## What This Example Shows

- Using `useSafeSmartAccount` from `@getpara/react-sdk`
- Creating a Safe smart account with Para as the owner
- Sending a zero-value sponsored transaction through Pimlico
- Displaying account loading, error, and success states
- Linking the transaction hash to Sepolia Etherscan

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

Optionally override the default Sepolia RPC URL:

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

2. Install dependencies:

```bash
yarn install
```

3. Build and run the production server:

```bash
yarn build
yarn start
```

For local development, use `yarn dev`.

4. Open `http://127.0.0.1:3000`.

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Pimlico API Key**: Get from [Pimlico Dashboard](https://dashboard.pimlico.io)

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The Pimlico API key remains an environment variable because it configures Safe account sponsorship for this example, not Para Portal settings.

## Related Example

For a Safe recovery flow where Para is a guardian instead of the Safe owner, see `aa-safe-4337-recovery`.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Safe4337Example.tsx
│   ├── ParaProvider.tsx
│   ├── layout/Header.tsx
│   └── ui/
│       ├── ConnectCard.tsx
│       ├── SendTransaction.tsx
│       └── WalletInfo.tsx
├── hooks/
│   └── useSafeSponsoredTransaction.ts
└── lib/
    └── safe.ts
```

## Key Integration Pattern

```tsx
import { useSafeSmartAccount } from "@getpara/react-sdk";
import { sepolia } from "viem/chains";

const { smartAccount, isLoading, error } = useSafeSmartAccount({
  pimlicoApiKey: process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? "",
  chain: sepolia,
  enabled: isConnected,
});

const receipt = await smartAccount.sendTransaction({
  to: "0x000000000000000000000000000000000000dEaD",
});
```

The hook creates a Safe 1.4.1 ERC-4337 account with the Para wallet as owner and sends the transaction through Pimlico sponsorship.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Safe ERC-4337 Documentation](https://docs.safe.global/advanced/erc-4337/4337-safe)
- [Pimlico Documentation](https://docs.pimlico.io)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
