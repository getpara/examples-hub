# Para + Graz Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-connector-graz.vercel.app)

A Next.js example demonstrating Para integration with Graz for Cosmos wallet connection and token transfers.

## What This Example Shows

- Setting up Graz providers with Para as a wallet connector
- Custom wallet connection modal with Para and other Cosmos wallets
- Checking connection state with graz's `useAccount`
- Sending Cosmos token transfers with graz's `useSendTokens`

## Setup

1. Create a `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
```

2. Install dependencies and run:

```bash
yarn install
yarn dev
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Main page with transfer flow
├── components/
│   ├── ConnectWalletModal.tsx  # Custom wallet connection modal
│   ├── layout/
│   │   ├── AppWrapper.tsx      # Modal context wrapper
│   │   └── Header.tsx          # Header with connect button
│   └── ui/
│       ├── BalanceCard.tsx     # Wallet balance display
│       ├── ConnectWalletCard.tsx
│       ├── TransferForm.tsx    # Token transfer form
│       └── TransactionHash.tsx # Transaction result display
├── config/
│   └── constants.ts            # Environment config
├── context/
│   ├── ModalContext.tsx        # Modal state management
│   └── Provider.tsx            # Graz provider setup
└── lib/
    └── para/client.ts          # Para client initialization
```

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Graz Documentation](https://graz.sh)
- [Cosmos SDK Documentation](https://docs.cosmos.network)
