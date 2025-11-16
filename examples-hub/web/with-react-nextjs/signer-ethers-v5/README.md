# Para SDK Ethers v5 Signer Example

This Next.js application demonstrates how to integrate the Para SDK with Ethers.js v5 for Ethereum wallet interactions. The example showcases various blockchain operations including ETH transfers, token transfers, contract deployment, message signing, and typed data signing using Para's wallet infrastructure.

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

- **@getpara/ethers-v5-integration** (2.0.0-alpha.26) - Para SDK integration for Ethers v5
- **@getpara/react-sdk** (2.0.0-alpha.26) - Para React SDK for wallet connections
- **ethers** (5.8.0) - Ethereum JavaScript library
- **@tanstack/react-query** (5.81.2) - Data fetching and state management
- **next** (15.1.5) - React framework
- **hardhat** - Ethereum development environment for contract compilation

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK provider setup and configuration
- `src/hooks/useParaSigner.ts` - Custom hook for Para signer integration with Ethers v5
- `src/hooks/useEthersProvider.ts` - Ethers provider setup hook
- `src/config/constants.ts` - Configuration constants including API key
- `src/app/*/page.tsx` - Example pages demonstrating various blockchain operations
- `src/contracts/ParaTestToken.sol` - Sample ERC20 token contract

## Learn More

- [Para Documentation](https://docs.getpara.com) - Official Para SDK documentation
- [Para Website](https://getpara.com) - Learn more about Para
- [Para Developer Portal](https://developer.getpara.com) - Developer resources and API reference
- [Ethers v5 Documentation](https://docs.ethers.io/v5/) - Ethers.js v5 documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
