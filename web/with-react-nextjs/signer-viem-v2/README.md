# Para SDK Viem v2 Signer Example

This Next.js application demonstrates how to integrate the Para SDK with Viem v2 for Ethereum wallet interactions. The example showcases various blockchain operations including ETH transfers, token transfers, contract deployment, message signing, and typed data signing using Para's wallet infrastructure with the latest Viem v2 features and improvements.

## Setup/Installation

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
```

### Package Manager Instructions

Using npm:
```bash
npm install
npm run dev
```

Using yarn:
```bash
yarn install
yarn dev
```

Using pnpm:
```bash
pnpm install
pnpm dev
```

## Key Dependencies

- **@getpara/viem-v2-integration** (2.0.0-alpha.26) - Para SDK integration for Viem v2
- **@getpara/react-sdk** (2.0.0-alpha.26) - Para React SDK for wallet connections
- **viem** (2.26.3) - TypeScript-first Ethereum library (v2)
- **@tanstack/react-query** (5.81.2) - Data fetching and state management
- **next** (15.1.5) - React framework
- **hardhat** - Ethereum development environment for contract compilation

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK provider setup and configuration
- `src/hooks/useParaSigner.ts` - Custom hook for Para signer integration with Viem v2
- `src/hooks/useViemProvider.ts` - Viem v2 client setup hook
- `src/config/constants.ts` - Configuration constants including API key
- `src/config/contracts.ts` - Contract configurations and ABIs
- `src/app/*/page.tsx` - Example pages demonstrating various blockchain operations
- `src/contracts/ParaTestToken.sol` - Sample ERC20 token contract

## Learn More

- [Para Documentation](https://docs.getpara.com) - Official Para SDK documentation
- [Para Website](https://getpara.com) - Learn more about Para
- [Para Developer Portal](https://developer.getpara.com) - Developer resources and API reference
- [Viem Documentation](https://viem.sh) - Viem documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
