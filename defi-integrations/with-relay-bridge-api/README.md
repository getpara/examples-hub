# Para Relay Bridge Example

This example demonstrates how to integrate Para authentication and Para-based signers (Viem for EVM chains and Solana
Web3 for SVM chains) with the Relay Bridge SDK/API. It allows users to authenticate using Para, query bridge quotes, and
execute asset bridging transactions seamlessly using authenticated session signers.

## Getting Started

Follow these steps to set up and run the example:

### 1. Setup Environment

Create your `.env` file based on `.env.example`. Ensure you set:

- Para API Key (`NEXT_PUBLIC_PARA_API_KEY`)
- Para Environment (`NEXT_PUBLIC_PARA_ENVIRONMENT`)
- RPC URLs (optional, recommended)

Example `.env`:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=beta

NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://base-sepolia-rpc.publicnode.com
NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL=https://api.devnet.solana.com
```

> **Note:** You can use either public RPC URLs or paid ones for improved reliability.

### 2. Install Dependencies

Install project dependencies using your preferred package manager:

```bash
npm install
# or
pnpm install
# or
yarn install
# or
bun install
```

### 3. Run the Application

Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
# or
bun dev
```

The app will be accessible at [http://localhost:3000](http://localhost:3000).

## Using the App

1. **Authenticate**: Click "Connect Wallet" to authenticate via Para. Ensure you've enabled EVM and Solana wallets in
   the [Para developer portal](https://developer.getpara.com).

2. **Get Testnet USDC**: Obtain testnet USDC tokens from the [Circle Faucet](https://faucet.circle.com/) for use within
   the app.

3. **Perform Bridge Transaction**:

   - Select your origin and destination networks.
   - Enter the amount of USDC to bridge.
   - Review the quote details provided by Relay.
   - Confirm and execute the bridging transaction.

## Additional Resources

For more information:

- Documentation: [docs.getpara.com](https://docs.getpara.com)
- Support: [support.getpara.com](https://support.getpara.com)

Enjoy seamless cross-chain asset bridging with Para and Relay!
