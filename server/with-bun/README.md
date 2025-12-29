# Para Server Integration with Bun

A minimal Bun server example demonstrating Para SDK server-side integration for wallet management and transaction signing with various Web3 libraries and Account Abstraction providers.

## What This Example Shows

- Creating and managing pre-generated wallets server-side
- Signing transactions with multiple libraries: Ethers, Viem, CosmJS, Solana Web3
- Integrating with Account Abstraction providers: Alchemy and ZeroDev
- Supporting both EIP-4337 and EIP-7702 smart account patterns

## Setup

1. Create a `.env` file:

```env
# Required for all examples
PARA_API_KEY=your_para_api_key
PARA_ENVIRONMENT=BETA
ENCRYPTION_KEY=your_32_byte_encryption_key

# For Alchemy AA examples
ALCHEMY_API_KEY=your_alchemy_api_key
ALCHEMY_GAS_POLICY_ID=your_gas_policy_id
ALCHEMY_RPC_URL=your_alchemy_rpc_url

# For ZeroDev AA examples
ZERODEV_PROJECT_ID=your_zerodev_project_id
ZERODEV_BUNDLER_RPC=your_bundler_rpc
ZERODEV_PAYMASTER_RPC=your_paymaster_rpc
ZERODEV_ARBITRUM_SEPOLIA_RPC=your_rpc_url
```

2. Install dependencies and run:

```bash
bun install
bun dev
```

The server runs at `http://localhost:8000`.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /wallets/pregen/create` | Create pre-generated wallets for an email |
| `POST /ethers/pregen` | Sign transaction with Ethers.js |
| `POST /viem/pregen` | Sign transaction with Viem |
| `POST /cosmjs/pregen` | Sign Cosmos transaction with CosmJS |
| `POST /solana-web3/pregen` | Sign Solana transaction |
| `POST /alchemy/pregen` | Send UserOperation via Alchemy (EIP-4337) |
| `POST /alchemy/eip7702` | Send transaction via Alchemy (EIP-7702) |
| `POST /zerodev/pregen` | Send UserOperation via ZeroDev (EIP-4337) |
| `POST /zerodev/eip7702` | Send transaction via ZeroDev (EIP-7702) |

## Project Structure

```
src/
├── index.ts              # Bun server setup
├── routes/
│   ├── createWallet.ts   # Wallet creation handler
│   ├── signWithEthers.ts # Ethers.js signing
│   ├── signWithViem.ts   # Viem signing
│   ├── signWithCosmJS.ts # CosmJS signing
│   ├── signWithSolanaWeb3.ts # Solana signing
│   ├── signWithAlchemy.ts    # Alchemy 4337
│   ├── signWithAlchemyEIP7702.ts # Alchemy 7702
│   ├── signWithZerodev.ts    # ZeroDev 4337
│   └── signWithZerodevEIP7702.ts # ZeroDev 7702
├── db/
│   └── keySharesDB.ts    # SQLite key share storage
├── utils/
│   └── encryption-utils.ts # AES-GCM encryption
└── contracts/
    └── Example.json      # Demo contract ABI
```

## Key Integration Pattern

```typescript
import { Para as ParaServer, Environment } from "@getpara/server-sdk";
import { createParaAccount, createParaViemClient } from "@getpara/viem-v2-integration";
import { http } from "viem";
import { sepolia } from "viem/chains";

// Initialize Para server client
const para = new ParaServer(Environment.BETA, PARA_API_KEY);

// Set user's key share (retrieved from your secure storage)
await para.setUserShare(decryptedKeyShare);

// Create Viem account - handles signing internally
const viemParaAccount = createParaAccount(para);

// Create Viem client for transactions
const viemClient = createParaViemClient(para, {
  account: viemParaAccount,
  chain: sepolia,
  transport: http(RPC_URL),
});

// Sign and send transactions
const signedTx = await viemClient.signTransaction(request);
```

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Alchemy API Key**: Get from [Alchemy Dashboard](https://dashboard.alchemy.com)
- **ZeroDev Project ID**: Get from [ZeroDev Dashboard](https://dashboard.zerodev.app)

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Alchemy Account Kit](https://docs.alchemy.com/docs/account-kit-overview)
- [ZeroDev Documentation](https://docs.zerodev.app)
