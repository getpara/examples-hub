# Para Modal + React + Vite Example

This example demonstrates the Para SDK integration with React and Vite, showcasing multichain wallet support across EVM (Ethereum, Polygon), Solana, and Cosmos ecosystems. It provides a minimal setup showing how to configure and trigger the Para Modal for unified authentication flows across all supported chains.

## Setup/Installation

### Environment Variables
Create a `.env` file in the project root and add your Para API key:
```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=beta
VITE_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Installation
Install dependencies using your preferred package manager:
```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

### Running the Development Server
```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

## Key Dependencies

- `@getpara/react-sdk`: 2.0.0-alpha.26
- `@getpara/evm-wallet-connectors`: 2.0.0-alpha.26
- `@getpara/cosmos-wallet-connectors`: 2.0.0-alpha.26
- `@getpara/solana-wallet-connectors`: 2.0.0-alpha.26
- `react`: 19.0.0
- `react-dom`: 19.0.0
- `vite`: ^6.1.0
- `@tanstack/react-query`: 5.81.4
- `wagmi`: 2.15.6
- `viem`: 2.31.4

## Key Files

- `/src/context/ParaProvider.tsx` - Para SDK provider configuration with multichain support
- `/src/context/QueryProvider.tsx` - React Query provider setup
- `/src/components/ui/ConnectWalletCard.tsx` - Wallet connection UI component
- `/src/components/ui/SignMessageForm.tsx` - Message signing functionality
- `/src/config/constants.ts` - Environment configuration and constants

## Learn More

- [Para SDK Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Wagmi Documentation](https://wagmi.sh)
- [TanStack Query Documentation](https://tanstack.com/query)