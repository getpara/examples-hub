# Para SDK Ethers v5 Signer Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-signer-ethers-v5.vercel.app)

This Next.js app demonstrates how to use Para with Ethers v5 for EVM wallet operations on Holesky. It includes message signing, ETH transfers, ERC20 transfers, contract deployment, contract interaction, batched contract calls, typed data signing, and permit signing.

## Setup

Create a `.env` file in this directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_HOLESKY_RPC_URL=https://ethereum-holesky-rpc.publicnode.com
```

Install dependencies and build the production app:

```bash
yarn install
yarn build
yarn start --hostname 127.0.0.1 --port 3000
```

`NEXT_PUBLIC_PARA_API_KEY` selects the Developer Portal project used by the app. `NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA` when omitted and can be set to `SANDBOX` or `PROD` when using keys from those environments. `NEXT_PUBLIC_HOLESKY_RPC_URL` is used by the local Ethers v5 JSON-RPC provider for demo reads and transactions.

## Developer Portal Configuration

Configure app identity, authentication methods, branding, theme, wallet visibility, and external wallet availability in the Para Developer Portal for the API key used by this example. This app does not set `configOverrides`; persistent project settings should come from the Developer Portal. `ParaProvider` keeps only API key/environment wiring, EVM connector setup, and runtime modal flags.

## Key Dependencies

- `@getpara/react-sdk-lite@3.0.0` provides the Para provider, modal, and hooks without pulling in every chain-specific integration.
- `@getpara/ethers-v5-integration@3.0.0` creates the Ethers v5 signer used by the example hooks.
- `@getpara/evm-wallet-connectors@3.0.0`, `wagmi@3.6.16`, `@wagmi/core@3.5.0`, and `viem@2.52.2` support the EVM external wallet connector.
- `ethers@5.8.0` is pinned to the latest Ethers v5 release because this example is specifically for Ethers v5.
- `next@16.2.7`, `react@19.2.7`, and `react-dom@19.2.7` run the app.
- `hardhat@3.8.0` and `@openzeppelin/contracts@5.6.1` compile the sample ERC20 contract.

## Key Files

- `src/components/ParaProvider.tsx` wires the Para provider, API key/environment, and Holesky EVM connector.
- `src/hooks/useParaSigner.ts` creates the `ParaEthersV5Signer` from the Para client and Ethers provider.
- `src/hooks/useEthersProvider.ts` creates the Ethers JSON-RPC provider.
- `src/hooks/use*.ts` contain the copyable signing, transfer, and contract interaction logic.
- `src/components/demos/*` contains the example UI that consumes the hooks.
- `src/app/*/page.tsx` contains server route wrappers and metadata.
- `src/contracts/ParaTestToken.sol` is the sample ERC20 contract compiled by Hardhat.

## Validation

```bash
yarn install
yarn install --immutable
yarn typecheck
yarn lint
yarn compile
rm -rf .next && yarn build
npx -y react-doctor@latest . --verbose --diff
yarn start --hostname 127.0.0.1 --port 3000
```

The production server should return HTTP 200 at `http://127.0.0.1:3000`, and the UI should render the selector page plus nested demo routes.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Ethers v5 Documentation](https://docs.ethers.io/v5/)
- [Next.js Documentation](https://nextjs.org/docs)
