# Para Modal + Solana Wallets Example

This repository demonstrates how to integrate [Para](https://getpara.com/) into a **Next.js** application using Solana
Wallet Connectors (e.g., Phantom, Glow, Backpack). The project scaffolds a minimal Next.js 15.x app, showing a Para
Modal that supports external wallet connections on Solana.

## Features

- **Next.js (App Router)** – Utilizing the latest Next.js version.
- **Para Modal** – Provides a user-friendly modal for authentication flows.
- **Solana Wallet Connectors** – Demonstrates connecting to Phantom, Glow, Backpack, etc.

## Prerequisites

1. **Node.js v18+** (or an environment that supports Next.js 15)
2. **yarn** / **npm** / **pnpm** / **bun** – choose your package manager
3. A [Para account + API key](https://developer.getpara.com/) in **BETA** or **PRODUCTION** environment

## Installation

1. **Clone** or download this repository:

   ```bash
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/web/react-nextjs/capsule-modal-solana
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
   - Make sure to use a valid Para API key and environment for `Environment.BETA` or `Environment.PRODUCTION`.

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

### Connecting a Solana Wallet

The **CapsuleModal** is configured to show external Solana wallets (Phantom, Backpack, Glow). When you click **Open Para
Modal**:

1. The Para Modal will appear.
2. Users can connect Phantom, Glow, or Backpack (or any other supported Solana wallet you configure).
3. Upon successful connection, you can read the user’s wallet address within your app.

### Files of Interest

- **`src/app/page.tsx`** - Contains a simple UI with a button opening the Para Modal for Solana wallets.
- **`src/app/components/CapsuleProviders.tsx`** - Wraps your app in `CapsuleSolanaProvider`, needed for external Solana
  wallet connections.
- **`src/client/capsule.ts`** - Creates a **CapsuleWeb** instance using your `NEXT_PUBLIC_PARA_API_KEY`.

### Important Packages

- `@usecapsule/react-sdk` – Core React SDK for Para.
- `@usecapsule/solana-wallet-connectors` – Connectors for Solana wallets (Phantom, Glow, Backpack, etc.).
- `@solana/wallet-adapter-*` – Official Solana adapter libraries and dependencies.

## Common Issues / Troubleshooting

1. **Hydration Mismatch**: May be triggered by browser extensions injecting unwanted attributes.
2. **Missing `pino-pretty` Warning**: If Next.js logs a warning about `pino-pretty` not found, you can ignore it or
   install it. It's used for local logging by underlying libraries.
3. **API Key**: Make sure your `.env` is set up correctly. `NEXT_PUBLIC_PARA_API_KEY` must be exposed to client code.
4. **Solana Devnet vs Mainnet**: The example defaults to Devnet with `clusterApiUrl`. Switch to Mainnet or your custom
   endpoint as needed.

---

**Enjoy building with Para + Solana wallets!** If you have any questions or need help, check out:

- [Para Docs](https://docs.getpara.com/)
- [Solana Docs](https://docs.solana.com/)
- [Next.js Documentation](https://nextjs.org/docs)

Happy coding!
