# Para SDK Ethers v5 Signer Example

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-ethers-v5.vercel.app)

This Next.js application demonstrates how to integrate the Para SDK with Ethers.js v5 for Ethereum wallet interactions. The example showcases various blockchain operations including ETH transfers, token transfers, contract deployment, message signing, and typed data signing using Para's wallet infrastructure.

## Setup/Installation

### Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_HOLESKY_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
```

`NEXT_PUBLIC_PARA_API_KEY` selects the Developer Portal project used by the app. `NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA` when omitted and can be set to `SANDBOX` or `PROD` when using keys from those environments. `NEXT_PUBLIC_HOLESKY_RPC_URL` is used only by the local Ethers v5 JSON-RPC provider for demo reads and transactions, and defaults to the public Holesky endpoint when omitted.

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

Configure app identity, authentication methods, branding, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key used by this example. This app does not set `configOverrides`; persistent project settings should come from the Developer Portal. The `ParaProvider` keeps only API key/environment, EVM connector wiring, and runtime modal flags.

## Key Dependencies

- **@getpara/ethers-v5-integration** (3.0.0-alpha.1) - Para SDK integration for Ethers v5
- **@getpara/react-sdk** (3.0.0-alpha.1) - Para React SDK for wallet connections
- **ethers** (5.8.0) - Ethereum JavaScript library
- **@tanstack/react-query** (5.90.12) - Data fetching and state management
- **next** (15.1.12) - React framework
- **hardhat** - Ethereum development environment for contract compilation

## Key Files

- `src/components/ParaProvider.tsx` - Para SDK provider setup, API key/environment wiring, EVM connector wiring, and runtime modal flags
- `src/hooks/useParaSigner.ts` - Custom hook for Para signer integration with Ethers v5
- `src/hooks/useEthersProvider.ts` - Ethers provider setup hook
- `src/app/*/page.tsx` - Example pages demonstrating various blockchain operations
- `src/contracts/ParaTestToken.sol` - Sample ERC20 token contract

## Learn More

- [Para Documentation](https://docs.getpara.com) - Official Para SDK documentation
- [Para Website](https://getpara.com) - Learn more about Para
- [Para Developer Portal](https://developer.getpara.com) - Developer resources and API reference
- [Ethers v5 Documentation](https://docs.ethers.io/v5/) - Ethers.js v5 documentation
- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework documentation
