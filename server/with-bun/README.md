# Bun Server with Para SDK Integration

This project demonstrates how to integrate the [Para SDK](https://docs.usepara.com/welcome) with a Bun server,
showcasing various ways to handle wallet creation and sign transactions using Para Pre-Generated (PreGen) wallets and
different signers. The project highlights several key libraries and protocols, such as Ethers, CosmJS, Viem, Solana
Web3, and Alchemy Account Abstraction (AA).

## Prerequisites

Before running the server, ensure that you have a `.env` file properly configured based on `.env.example`. The following
environment variables are required:

- `ENCRYPTION_KEY=your_encryption_key_here`
- `PARA_API_KEY=your_para_api_key_here`
- `ALCHEMY_API_KEY=your_alchemy_api_key_here`
- `ALCHEMY_GAS_POLICY_ID=your_alchemy_gas_policy_id_here`

## Running the Server

1. Install dependencies:

   ```bash
   bun install
   ```

2. Start the server in development mode:
   ```bash
   bun dev
   ```

Alternatively, you can run the server directly with:

```bash
bun run server.ts
```

## Available Routes

The server starts on port `8000`. The following routes are available for interacting with the wallet and signing
functionalities. Each route requires an `email` in the request body, and all requests must be authenticated using a
Bearer token in the `Authorization` header.

### Example Request

- **[POST] `/wallets/create`** - Creates a new Para Pre-Generated wallet.
  ```bash
  curl -X POST http://localhost:8000/wallets/create -H "Content-Type: application/json" -d '{"email": "user@example.com"}'
  ```

## Learn More

For more detailed documentation and API references, visit the official
[Para SDK documentation](https://docs.usepara.com/welcome).
