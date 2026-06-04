# Para SDK Ethers v6 Signer Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-ethers-v6.vercel.app)

This Next.js application demonstrates how to integrate the Para SDK with Ethers.js v6 for Ethereum wallet interactions. The example showcases various blockchain operations including ETH transfers, token transfers, contract deployment, message signing, and typed data signing using Para's wallet infrastructure with the latest Ethers v6 API.

## Setup/Installation

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_HOLESKY_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
```

`NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA` when omitted. `NEXT_PUBLIC_HOLESKY_RPC_URL` is optional and only controls the Ethers.js provider used by the signing demo. It is not Para project configuration.

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

## Developer Portal Configuration

This example expects app identity, authentication methods, branding, theme, wallet visibility, and external EVM wallet availability to be configured in the Para Developer Portal for the API key. The `ParaProvider` keeps only API key/environment, required Holesky EVM connector wiring for the signer demo, and runtime modal behavior.

## Key Dependencies

- **@getpara/ethers-v6-integration** (3.0.0-alpha.1) - Para SDK integration for Ethers v6
- **@getpara/react-sdk** (3.0.0-alpha.1) - Para React SDK for wallet connections
- **ethers** (6.15.0) - Ethereum JavaScript library (v6)
- **@tanstack/react-query** (5.90.12) - Data fetching and state management
- **next** (15.1.12) - React framework
- **hardhat** - Ethereum development environment for contract compilation

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK provider setup and configuration
- `src/lib/provider.ts` - Ethers v6 JSON-RPC provider setup
- `src/hooks/use*` - Hooks for Para signer integration with Ethers v6
- `src/config/contracts.ts` - Contract configurations and ABIs
- `src/app/*/page.tsx` - Example pages demonstrating various blockchain operations
- `src/contracts/ParaTestToken.sol` - Sample ERC20 token contract

## Learn More

- [Para Documentation](https://docs.getpara.com) - Official Para SDK documentation
- [Para Website](https://getpara.com) - Learn more about Para
- [Para Developer Portal](https://developer.getpara.com) - Developer resources and API reference
- [Ethers v6 Documentation](https://docs.ethers.io/v6/) - Ethers.js v6 documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
