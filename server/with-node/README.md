
# Para Integration with Node Server

This Node.js example demonstrates integrating the Para SDK server-side for wallet management and transaction signing using pre-generated or session-based wallets. It provides examples for common web3 libraries including Ethers, Viem, CosmJS, Solana-Web3, and Alchemy Account Abstraction. Use this as a guide for implementing Para within your Node.js backend.

## Key Files/Folders

-   `examples/`: Contains all integration example scripts.
-   `ethers/`, `viem/`, `cosmjs/`, `solana-web3/`, `alchemy-aa/`: Integration examples for each library, separated into `pregen.ts` (pre-generated wallet) and `session.ts` (session-based wallet) scenarios.
-   `pregen/pregen-create.ts`: Script specifically for creating pre-generated wallets.
-   `.env.example`: Template outlining required environment variables.

## Prerequisites

-   **Node.js & Package Manager**: Node.js and `yarn` (or `npm`) installed.
-   **Environment Variables**: Create a `.env` file in the project root (copy `.env.example`) and set the following:
    -   `PARA_API_KEY`: **Required for all examples.** Get from [developer.getpara.com](https://developer.getpara.com).
    -   `ENCRYPTION_KEY`: **Required for pre-generated wallet examples.** Must be a 32-byte encryption key.
    -   `ALCHEMY_API_KEY`, `ALCHEMY_GAS_POLICY_ID`: **Required for Alchemy-AA examples.**

## Installation

1.  Navigate to the example directory:
    ```bash
    cd examples-hub/server/with-node # Adjust path if necessary
    ```
2.  Install dependencies:
    ```bash
    yarn install
    # or
    npm install
    ```

## Running the Example

1.  Start the development server:
    ```bash
    yarn dev
    # or
    npm run dev
    ```
    The server will be running at `http://localhost:3000`.

2.  Send requests to the example endpoints (mounted under `/examples/`). Refer to the comments within each specific `.ts` file inside the `examples/` subdirectories for the exact endpoint path, HTTP method (usually POST), and required JSON request body.

    *Example using `curl` to create a pre-generated wallet:*
    ```bash
    curl -X POST http://localhost:3000/examples/wallets/pregen/create \
      -H "Content-Type: application/json" \
      -d '{"email":"user@example.com"}'
    ```

## Learn More

For more details, visit the [Para SDK documentation](https://docs.usepara.com/welcome).