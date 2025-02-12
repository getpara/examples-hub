# Para Integration with Node Server

This repository provides a Node-based example showcasing how to integrate the [Para SDK](https://docs.usepara.com) into
a server environment for transaction signing and wallet management. It demonstrates various scenarios including
pre-generated wallets, session-based wallets, and integration with multiple ecosystems such as Ethers, Viem, CosmJS,
Solana-Web3, and Alchemy-AA.

## Distinction Between Pre-Generated and Session-Based Wallets

- **Pre-Generated Wallet:**  
  Created ahead of time and associated with a user (e.g., via `email`). Ideal for cases where you want a wallet ready
  before any signing occurs.  
  [Pre-Generation Integration Guide](https://docs.usepara.com/integration-guides/wallet-pregeneration)

- **Session-Based Wallet:**  
  Created and managed through active Para user sessions. You import/export sessions as needed, allowing the user’s
  wallet to be accessed server-side as long as a valid session is present.  
  [Session Management Integration Guide](https://docs.usepara.com/integration-guides/session-management)

## Key Example Locations

Refer to these links to explore different integrations. Each file contains detailed comments explaining prerequisites,
environment variables, and steps needed before calling the routes.

- [**Para Integration Examples**](./examples/para)

  - [Pre-Gen](./examples/para/pregen.ts)
  - [Session](./examples/para/session.ts)

- [**Ethers Integration Examples**](./examples/ethers)

  - [Pre-Gen](./examples/ethers/pregen.ts)
  - [Session](./examples/ethers/session.ts)

- [**Viem Integration Examples**](./examples/viem)

  - [Pre-Gen](./examples/viem/pregen.ts)
  - [Session](./examples/viem/session.ts)

- [**CosmJS Integration Examples**](./examples/cosmjs)

  - [Pre-Gen](./examples/cosmjs/pregen.ts)
  - [Session](./examples/cosmjs/session.ts)

- [**Solana-Web3 Integration Examples**](./examples/solana-web3)

  - [Pre-Gen](./examples/solana-web3/pregen.ts)
  - [Session](./examples/solana-web3/session.ts)

- [**Alchemy-AA Integration Examples**](./examples/alchemy-aa)

  - [Pre-Gen](./examples/alchemy-aa/pregen.ts)
  - [Session](./examples/alchemy-aa/session.ts)

- [**Pre-Generated Wallet Creation**](./examples/wallets)
  - [Create Pregen Wallet](./examples/wallets/pregen-create.ts)

## Prerequisites

- **Para API Key:**  
  Required for all routes. Sign up or manage your keys at [developer.usepara.com](https://developer.usepara.com).

- **Additional Environment Variables:**  
  Based on the integration you are testing:

  - For Alchemy-AA: `ALCHEMY_API_KEY` and `ALCHEMY_GAS_POLICY_ID` are required.
  - For Pre-Generated Wallets: `ENCRYPTION_KEY` (32 bytes) is needed to securely store the user’s key share in the DB.

  Copy `.env.example` to `.env` and set the required variables.

## Getting Started

1. **Install Dependencies:**

   ```bash
   yarn install
   ```

2. **Configure `.env`:**
   - Set `PARA_API_KEY`.
   - If using Alchemy-AA, set `ALCHEMY_API_KEY` and `ALCHEMY_GAS_POLICY_ID`.
   - If using pre-generated wallets, set `ENCRYPTION_KEY` to securely store user shares.
3. **Start the Server:**
   ```bash
   yarn dev
   ```
   The server starts on `http://localhost:3000`.

## Calling the Routes

All routes are mounted under `/examples/` and grouped by integration type and scenario. Refer to comments in each file
for details on what is expected in the request body and prerequisites (like having created a wallet first).

### Using curl (CLI)

- **Create a Pre-Generated Wallet:**

  ```bash
  curl -X POST http://localhost:3000/examples/wallets/pregen/create \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com"}'
  ```

- **Sign with Para (Pre-Gen):**

  ```bash
  curl -X POST http://localhost:3000/examples/para/pregen \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com"}'
  ```

- **Sign with Para (Session-Based):**
  ```bash
  curl -X POST http://localhost:3000/examples/para/session \
    -H "Content-Type: application/json" \
    -d '{"session":"<exported_session_string>"}'
  ```

Replace endpoints and request bodies accordingly for Ethers, Viem, CosmJS, Solana-Web3, and Alchemy-AA examples.

### Using Postman

1. **Import the Request:**

   - Create a new POST request.
   - Set the URL, e.g. `http://localhost:3000/examples/ethers/pregen`.
   - In the "Body" tab, select "raw" and "JSON" format, then provide the required JSON (e.g.,
     `{"email":"user@example.com"}`).

2. **Add Headers:**

   - Add `Content-Type: application/json`.

3. **Send the Request:**
   - Click "Send" to execute the request.
   - Check the response for signed transactions or success messages.

### Adjusting Parameters

- For ETH-based operations, change `email` or `session` to reference different users/sessions.
- For Solana or Cosmos, adjust RPC endpoints and transaction parameters as needed.
- For Alchemy-AA, ensure you’ve set the correct Alchemy credentials and have created a pre-generated wallet or set up a
  session.

## Adapting for Production

These examples focus on demonstrating how to integrate Para into your codebase. Before deploying to production:

- Implement proper authentication and authorization.
- Improve error handling and logging.
- Integrate your own business logic, security measures, and monitoring.

## Additional Resources

- [Para SDK Documentation](https://docs.usepara.com)
- [Pre-Generation Integration Guide](https://docs.usepara.com/integration-guides/wallet-pregeneration)
- [Session Management Integration Guide](https://docs.usepara.com/integration-guides/session-management)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Viem Documentation](https://viem.sh/)
- [CosmJS Documentation](https://cosmos.github.io/cosmjs/)
- [Solana-Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Alchemy AA Documentation](https://docs.alchemy.com/alchemy/)
