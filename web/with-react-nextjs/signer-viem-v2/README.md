# Para SDK Viem v2 Signer Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-viem-v2.vercel.app)

This Next.js application demonstrates how to integrate the Para SDK with Viem v2 for Ethereum wallet interactions. The example showcases various blockchain operations including ETH transfers, token transfers, contract deployment, message signing, and typed data signing using Para's wallet infrastructure with the latest Viem v2 features and improvements.

## Setup/Installation

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
```

### Package Manager Instructions

This example includes a `yarn.lock`, so use Yarn for deterministic local setup:

```bash
yarn install
yarn dev
```

## Developer Portal Configuration

Create the API key in the Para Developer Portal and configure the app identity, authentication methods, branding, theme, wallet visibility, and external wallet settings for that key there. This example does not set Portal-owned config in code. The `ParaProvider` keeps only the API key, Para environment, the EVM connector wiring needed for the Viem signer flows, and runtime modal behavior.

The demo uses Sepolia and a public Sepolia RPC URL from `src/config/constants.ts`; no RPC URL environment variable is required.

## Key Dependencies

- **@getpara/viem-v2-integration** (3.0.0-alpha.1) - Para SDK integration for Viem v2
- **@getpara/react-sdk** (3.0.0-alpha.1) - Para React SDK for wallet connections
- **viem** (2.42.1) - TypeScript-first Ethereum library (v2)
- **@tanstack/react-query** (5.90.12) - Data fetching and state management
- **next** (15.1.12) - React framework
- **hardhat** - Ethereum development environment for contract compilation

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK provider setup and configuration
- `src/hooks/useDeployContract.ts` - Custom hook for Para contract deployment with Viem v2
- `src/lib/viem.ts` - Viem v2 public client setup
- `src/config/constants.ts` - Configuration constants including API key
- `src/lib/contracts.ts` - Contract configurations and ABIs
- `src/app/*/page.tsx` - Example pages demonstrating various blockchain operations
- `src/contracts/ParaTestToken.sol` - Sample ERC20 token contract

## Learn More

- [Para Documentation](https://docs.getpara.com) - Official Para SDK documentation
- [Para Website](https://getpara.com) - Learn more about Para
- [Para Developer Portal](https://developer.getpara.com) - Developer resources and API reference
- [Viem Documentation](https://viem.sh) - Viem documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
