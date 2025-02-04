# Capsule Modal + Cosmos Wallets Example

This repository demonstrates how to integrate [Capsule](https://usecapsule.com/) into a **Next.js** application using
Cosmos External Wallets (such as **Keplr** and **Leap**). The project scaffolds a minimal Next.js 15.x app, showing a
Capsule Modal that supports external wallet connections in the Cosmos ecosystem.

## Features

- **Next.js (App Router)** – Utilizing the latest Next.js version.
- **Capsule Modal** – Provides a user-friendly modal for authentication flows.
- **Cosmos Wallet Connectors** – Demonstrates connecting to Keplr and Leap wallets.

## Prerequisites

1. **Node.js v18+** (or an environment that supports Next.js 15)
2. **yarn** / **npm** / **pnpm** / **bun** – choose your package manager
3. A [Capsule account + API key](https://developer.usecapsule.com/) in **BETA** or **PRODUCTION** environment.

## Installation

1. **Clone** or download this repository:

   ```bash
   git clone https://github.com/capsule-org/examples-hub.git
   cd examples-hub/web/react-nextjs/capsule-modal-cosmos
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

3. **Generate Graz Chains** (optional, if you see type issues):

   ```bash
   yarn graz --generate
   ```

   or

   ```bash
   npx graz --generate
   ```

4. **Set up Environment Variables**:
   - Create a `.env` file (or `.env.local` in Next.js) with:
     ```bash
     NEXT_PUBLIC_PARA_API_KEY=YOUR_PARA_API_KEY
     ```
   - Make sure to use a valid Capsule API key and environment for the `Environment.BETA` or `Environment.PRODUCTION`.

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
labeled **Connect Wallet**.

### Connecting a Cosmos Wallet

The **CapsuleModal** is configured to show external Cosmos wallets (Keplr, Leap). When you click **Connect Wallet**:

1. The Capsule Modal will appear.
2. Users can either connect Keplr or Leap (or any other wallet you configure).
3. Upon successful connection, you can read the user’s wallet address within your own app.

### Files of Interest

- **`src/app/page.tsx`** Contains a simple UI with a button opening the Capsule Modal and demonstration of external
  wallets.
- **`src/app/components/CapsuleProviders.tsx`** Wraps your app in the `CapsuleCosmosProvider`, which is needed for
  external Cosmos wallets.
- **`src/client/capsule.ts`** Creates a **CapsuleWeb** instance using your `NEXT_PUBLIC_PARA_API_KEY`. You can switch
  between `Environment.BETA` or `Environment.PRODUCTION`.

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

## Common Issues / Troubleshooting

1. **Hydration Mismatch**: If you see a console warning about hydration failing, it’s often caused by browser extensions
   (like Grammarly) injecting attributes.
2. **Missing `pino-pretty` Warning**: If Next.js logs a warning about `pino-pretty` not found, you can ignore it or
   install `pino-pretty` as a dev dependency. It’s used by underlying libraries for local logging.
3. **API Key**: Make sure your `.env` is set up correctly. The `NEXT_PUBLIC_PARA_API_KEY` must be exposed to client
   code.
4. **Package Versions**: If you see a module resolution conflict (e.g.,
   `@leapwallet/cosmos-social-login-capsule-provider` referencing older versions), ensure your `@usecapsule/core-sdk`,
   `@usecapsule/react-sdk`, etc., match the same major version range.

---

**Enjoy building with Capsule and Cosmos wallets!** If you have any questions or need help, check out:

- [Capsule Docs](https://docs.usecapsule.com/)
- [Cosmos Docs](https://docs.cosmos.network/)
- [Next.js Documentation](https://nextjs.org/docs)

Feel free to open issues or PRs if you find something that needs improving. Happy coding!
