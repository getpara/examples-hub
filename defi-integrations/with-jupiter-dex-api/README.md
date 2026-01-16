# Jupiter DEX API with Para SDK Demo

This project demonstrates how to use the Para SDK as a transaction signer for Jupiter DEX API transactions in a NextJS
application. It showcases a simple token swap interface that leverages Jupiter's powerful DEX aggregator to provide
optimal token swaps on Solana.

## Features

- Connect to wallets via Para SDK (email, social, and wallet connections)
- Fetch token data from Jupiter API
- Get swap quotes with optimal routing
- Execute swaps with Para SDK as the transaction signer
- Real-time transaction status updates

## Getting Started

### Environment Setup

1. Clone the repository
2. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

3. Configure the required environment variables:

```
NEXT_PUBLIC_PARA_API_KEY=your-para-api-key
NEXT_PUBLIC_MAINNET_RPC_URL=your-mainnet-rpc-url
```

- For a Para API key, visit [developer.getpara.com](https://developer.getpara.com)
- You can use a public RPC endpoint for development or get a dedicated one from providers like Helius, QuickNode, or
  Triton

### Installation

Install dependencies:

```bash
yarn install
```

### Running the App

Start the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## How It Works

1. The app uses Para SDK to handle wallet connections and transaction signing
2. Token data is fetched from Jupiter's token API
3. When a user selects tokens and enters an amount to swap:
   - The app fetches a quote from Jupiter's Quote API
   - On swap initiation, it gets a serialized transaction from Jupiter's Swap API
   - Para SDK signs the transaction
   - The signed transaction is sent to the Solana network
   - Transaction status is tracked and displayed to the user

## Learn More

- Para SDK Documentation: [docs.getpara.com](https://docs.getpara.com)
- Jupiter API Documentation: [docs.jup.ag](https://docs.jup.ag)
- Solana Web3.js: [solana-labs/solana-web3.js](https://github.com/solana-labs/solana-web3.js)
