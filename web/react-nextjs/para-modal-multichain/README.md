# Capsule Modal + All Chains Example

This repository demonstrates how to integrate [Capsule](https://usecapsule.com/) into a **Next.js** application with
support for all major blockchains—Cosmos, Solana, and EVM—in one project. The application scaffolds a minimal Next.js
15.x setup, showing how to open a single Capsule Modal that supports:

- **Cosmos Wallets** (e.g., Keplr, Leap)
- **Solana Wallets** (e.g., Phantom, Backpack, Glow)
- **EVM Wallets** (e.g., Metamask, Coinbase, WalletConnect, Rainbow, Zerion)
- **Social OAuth** (Apple, Google, Facebook, Discord, etc.)
- **Email / Phone Number** login
- …and more.

## Features

- **Next.js (App Router)** – Utilizing the latest Next.js version.
- **Capsule Modal** – Provides a user-friendly modal for authentication flows across multiple blockchains and OAuth
  providers.
- **Cosmos / EVM / Solana Connectors** – Demonstrates how to unify wallet connections in a single Next.js application.

## Prerequisites

1. **Node.js v18+** (or environment that supports Next.js 15)
2. **yarn** / **npm** / **pnpm** / **bun** – pick your package manager
3. A [Capsule account + API key](https://developer.usecapsule.com/) in **BETA** or **PRODUCTION** environment

## Installation

1. **Clone** or download this repository:

   ```bash
   git clone https://github.com/capsule-org/examples-hub.git
   cd examples-hub/web/react-nextjs/capsule-modal-all
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
   - Make sure to use a valid Capsule API key and environment for `Environment.BETA` or `Environment.PRODUCTION`.
4. **(Optional) `postinstall` scripts**:
   - The `package.json` includes a `postinstall` script (`yarn graz --generate`) which regenerates certain Cosmos chain
     definitions. If you see type errors, re-run `yarn graz --generate` or `npx graz --generate`.

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

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see a homepage with a button labeled
**Open Capsule Modal**.

### Connecting Wallets

Upon clicking **Open Capsule Modal**, you’ll see a single Capsule Modal that includes:

- **Cosmos external wallets**: Keplr, Leap, etc.
- **Solana external wallets**: Phantom, Backpack, Glow.
- **EVM external wallets**: Metamask, Coinbase, WalletConnect, Rainbow, Zerion, etc.
- **Social login** (Apple, Google, Twitter, etc.) if configured.
- **Email / Phone number** login, if not disabled.

You can customize which wallet connectors appear, or disable certain login flows entirely.

### Files of Interest

- **`src/app/page.tsx`** - A simple UI with a button to open the Capsule Modal. The external wallets from Cosmos,
  Solana, and EVM are merged into a single array, enabling multi-chain support.
- **`src/components/CapsuleProviders.tsx`** - Provides multi-chain context, hooking in all the required connectors:
  - `CapsuleCosmosProvider` for Cosmos
  - `CapsuleSolanaProvider` for Solana
  - `CapsuleEvmProvider` for EVM
- **`src/client/capsule.ts`** - Creates a single **CapsuleWeb** instance using your `NEXT_PUBLIC_PARA_API_KEY`.

### Important Packages

- `@usecapsule/react-sdk` – Core React SDK for Capsule.
- `@usecapsule/cosmos-wallet-connectors` – Connectors for Cosmos wallets (Keplr, Leap, etc.).
- `@usecapsule/graz` – A specialized fork of graz with Capsule integration.
- `@leapwallet/cosmos-social-login-capsule-provider` – A peer dependency for Leap’s integration (required even if you
  don’t actively use Leap social login).
- `@usecapsule/core-sdk` – Core library that the React SDK depends on. We add this to override the out of date
  `@leapwallet/cosmos-social-login-capsule-provider` which is using an older version of the core-sdk.
- `@usecapsule/user-management-client` – User management client for Capsule. Again, we add this to override the out of
  date `@leapwallet/cosmos-social-login-capsule-provider` which is using an older version of the user-management-client
  via the core-sdk.
- `@usecapsule/evm-wallet-connectors` – Connectors for EVM wallets (Metamask, WalletConnect, etc.).
- `wagmi` – EVM-based chain utility library used in the example.
- `@usecapsule/solana-wallet-connectors` – Connectors for Solana wallets (Phantom, Glow, Backpack, etc.).
- `@solana/wallet-adapter-*` – Official Solana adapter libraries and dependencies.

## Common Issues / Troubleshooting

1. **Hydration Mismatch**: If you see a console warning about a hydration mismatch, it’s often caused by browser
   extensions injecting extra attributes into the DOM.
2. **Missing `pino-pretty` Warning**: Next.js might log about `pino-pretty` not being found. This is optional for local
   logging by underlying libraries and can be safely ignored or installed if you prefer.
3. **API Key**: Ensure `.env` is set up correctly. The `NEXT_PUBLIC_PARA_API_KEY` must be exposed to client code.
4. **Chain Config**:
   - Update the default chain(s) in your provider code if you want to switch from testnets to mainnets or different
     endpoints (e.g., `clusterApiUrl` for Solana, `chains` for EVM, or `rpc`/`rest` for Cosmos).
5. **Partial Logins**: If you prefer only external wallets or only social logins, you can pass props to the
   `<CapsuleModal>` to disable email/phone or certain external wallet arrays.

---

**Enjoy building with Capsule + multi-chain wallets!** If you have any questions or need help, check out:

- [Capsule Docs](https://docs.usecapsule.com/)
- [Cosmos Docs](https://docs.cosmos.network/)
- [Solana Docs](https://docs.solana.com/)
- [wagmi Docs (for EVM)](https://wagmi.sh/)
- [Next.js Documentation](https://nextjs.org/docs)

# Happy coding!
