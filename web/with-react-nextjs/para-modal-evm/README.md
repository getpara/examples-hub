# Para Modal + EVM Wallets Example

This repository demonstrates how to integrate [Para](https://getpara.com/) into a **Next.js** application using EVM
Wallet Connectors (e.g., Metamask, Coinbase, WalletConnect). The project scaffolds a minimal Next.js 15.x app, showing a
Para Modal that supports external wallet connections on EVM-based blockchains.

## Features

- **Next.js (App Router)** – Utilizing the latest Next.js version.
- **Para Modal** – Provides a user-friendly modal for authentication flows.
- **EVM Wallet Connectors** – Demonstrates connecting to Metamask, WalletConnect, Coinbase, etc.

## Prerequisites

1. **Node.js v18+** (or an environment that supports Next.js 15)
2. **yarn** / **npm** / **pnpm** / **bun** – choose your package manager
3. A [Para account + API key](https://developer.getpara.com/) in **BETA** or **PRODUCTION** environment

## Installation

1. **Clone** or download this repository:

   ```bash
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/web/react-nextjs/capsule-modal-evm
   ```

2. **Install Dependencies**:

   ```bash
   yarn install
   # or
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up Environment Variables**:
   - Create a `.env` (or `.env.local`) file with:
     ```bash
     NEXT_PUBLIC_PARA_API_KEY=YOUR_PARA_API_KEY
     ```
   - Make sure to use a valid Para API key and environment for the `Environment.BETA` or `Environment.PRODUCTION`.

## Usage

### Running the Development Server

```bash
yarn dev
# or
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see a basic homepage with a button
labeled **Open Para Modal**.

### Connecting an EVM Wallet

The **CapsuleModal** is configured to show external EVM wallets (Metamask, Coinbase, WalletConnect, etc.). When you
click **Open Para Modal**:

1. The Para Modal will appear.
2. Users can connect any supported EVM wallet that you configure.
3. Upon successful connection, you can read the user’s wallet address within your app.

### Files of Interest

- **`src/app/page.tsx`** - A simple UI with a button to open the Para Modal for EVM wallets.
- **`src/app/components/CapsuleProviders.tsx`** - Wraps your app in `CapsuleEvmProvider`, needed for external EVM wallet
  connections.
- **`src/client/capsule.ts`** - Creates a **CapsuleWeb** instance using your `NEXT_PUBLIC_PARA_API_KEY`.

### Important Packages

- `@usecapsule/react-sdk` – Core React SDK for Para.
- `@usecapsule/evm-wallet-connectors` – Connectors for EVM wallets (Metamask, WalletConnect, etc.).
- `wagmi` – EVM-based chain utility library used in the example.

## Common Issues / Troubleshooting

1. **Hydration Mismatch**: You may see a console warning about hydration mismatch if a browser extension injects
   attributes.
2. **Missing `pino-pretty` Warning**: Next.js might log a warning about `pino-pretty` not found. You can safely ignore
   this or install it.
3. **API Key**: Make sure your `.env` is set up correctly. The `NEXT_PUBLIC_PARA_API_KEY` must be exposed to client
   code.
4. **Chain Config**: The example uses test networks (e.g., Sepolia). Update to mainnet or other chains as you see fit.

---

**Enjoy building with Para + EVM wallets!** If you have any questions or need help, check out:

- [Para Docs](https://docs.getpara.com/)
- [Wagmi Docs](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

Happy coding!
