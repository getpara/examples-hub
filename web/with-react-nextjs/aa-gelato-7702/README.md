# Gelato EIP-7702 + Para Embedded Wallet Demo

This example demonstrates the integration of Gelato's smart account with EIP-7702 gas sponsorship and Para's embedded
wallet in a Next.js application. Users can execute gasless transactions on Ethereum Sepolia using Para's wallet for
authentication and Gelato for transaction sponsorship.

## Overview

This demo showcases:

- **Para Embedded Wallet**: Non-custodial wallet solution with social login
- **Gelato Smart Account**: EIP-7702 enabled account for gas sponsorship
- **Custom Signature Handling**: Override Para's default signing to handle v-byte recovery for EIP-7702 compatibility
- **Gasless Transactions**: Execute transactions without holding ETH through Gelato's paymaster

## Technical Architecture

### EIP-7702 & Gas Sponsorship

EIP-7702 allows EOAs (Externally Owned Accounts) to temporarily delegate execution to smart contracts. This enables:

- Gas sponsorship without deploying a smart contract wallet
- Temporary code delegation from EOA to Gelato's smart contract
- Seamless gasless transactions while maintaining EOA ownership

### Signature Handling

Para's embedded wallet returns signatures with v-bytes of 0/1, while Ethereum typically expects 27/28. This
implementation includes custom signature handlers that:

- Convert Para's v-byte format (0/1) to Ethereum format (27/28) for regular messages
- Handle EIP-7702 authorization signatures with proper v-byte values (0/1)
- Support typed data signing required by Gelato's smart wallet

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Para API key from [Para Dashboard](https://developer.getpara.com)
- Gelato API key from [Gelato Dashboard](https://app.gelato.cloud/dashboard)

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Para Configuration
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA  # or SANDBOX for testing

# Gelato Configuration
NEXT_PUBLIC_GELATO_API_KEY=your_gelato_api_key
```

### Installation

Install dependencies:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

### Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Implementation Details

### Custom Signature Utilities (`src/utils/paraSignature.ts`)

Handles the conversion between Para's signature format and Ethereum standards:

- `customSignMessage`: Signs messages with v-byte adjustment (0/1 → 27/28)
- `customSignAuthorization`: Signs EIP-7702 authorizations with proper v-byte (0/1)
- `customSignTypedData`: Signs typed data for Gelato smart wallet operations

### Gelato Smart Wallet Hook (`src/hooks/useGelatoSmartWallet.ts`)

Initializes and manages the Gelato smart wallet:

1. Gets Para's Viem account from the embedded wallet
2. Overrides signing methods with custom implementations
3. Creates Gelato smart account with EIP-7702 support
4. Provides sponsored transaction execution

### Key Components

- `src/context/GelatoProvider.tsx` - Gelato wallet context provider
- `src/components/SponsoredTransaction.tsx` - UI for executing gasless transactions
- `src/config/constants.ts` - Configuration constants for Para and Gelato

## How It Works

1. **User Connection**: User connects via Para's embedded wallet (social login or email)
2. **Account Creation**: Para provides a Viem account object with the user's EOA
3. **Smart Account Setup**: Gelato creates a smart account using the Para EOA as owner
4. **Signature Override**: Custom signing methods handle Para's v-byte format
5. **Transaction Execution**: User can execute transactions without holding ETH
6. **Gas Sponsorship**: Gelato's paymaster covers gas fees through EIP-7702 delegation

## Network Support

Currently configured for **Ethereum Sepolia** testnet. To change networks:

1. Update the chain import in `src/hooks/useGelatoSmartWallet.ts`
2. Ensure your Gelato API key supports the target network
3. Update any hardcoded contract addresses

## Troubleshooting

### Signature Validation Errors

If you encounter signature validation errors, ensure:

- The custom signature utilities are properly imported
- Para client is initialized before attempting to sign
- V-byte conversion is applied correctly for the transaction type

### Gas Sponsorship Issues

- Verify your Gelato API key is valid and has sufficient credits
- Check that the target network is supported by your Gelato configuration
- Ensure the transaction is within Gelato's sponsorship limits

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Gelato Documentation](https://docs.gelato.cloud)
- [EIP-7702 Specification](https://eips.ethereum.org/EIPS/eip-7702)
- [Viem Documentation](https://viem.sh)
