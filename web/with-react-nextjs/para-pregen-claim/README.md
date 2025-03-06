# Para Pregen Claim Example

This repository demonstrates how to integrate [Para](https://getpara.com/) into a **Next.js** application with a more
advanced flow for **pre-generated (pregen) wallets**, where you create a wallet server-side and later let the user claim
it in the client. This builds on the basic Para Modal example by adding a pregen wallet generation and client-side
claiming logic.

## Features

- **Next.js (App Router)** – Utilizing the latest Next.js version (15.x).
- **Pregen Wallet Flow** – Demonstrates how to create a wallet on the server and later allow a user to claim it.
- **Para Modal** – Provides a user-friendly modal for Para authentication flows.

## Prerequisites

1. **Node.js v18+** (or an environment that supports Next.js 15)
2. A package manager (e.g., **yarn**, **npm**, **pnpm**, or **bun**)
3. A [Para account + API key](https://developer.getpara.com/) (BETA or PRODUCTION environment)

## Installation

1. **Clone or download** this repository. For example:

   ```bash
   git clone https://github.com/getpara/examples-hub.git
   cd examples-hub/web/with-react-nextjs/para-pregen-claim
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   # or
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**:

   Create a `.env` or `.env.local` file in the root of this project and set:

   ```bash
   NEXT_PUBLIC_PARA_API_KEY=YOUR_PARA_API_KEY
   PARA_API_KEY=YOUR_PARA_API_KEY
   ```

   - `NEXT_PUBLIC_PARA_API_KEY` is exposed to the client for `para` usage in the browser.
   - `PARA_API_KEY` is used on the server in the `/api` routes.

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

Visit [http://localhost:3000](http://localhost:3000) to see the demo.

## How It Works

1. **Generate a Pregen Wallet** – The server (via `/api/wallet/generate`) creates a new wallet with a random UUID.
2. **User Authenticates** – The user logs in via the Para Modal (client-side).
3. **Retrieve User Share & Claim** – Once authenticated, the client retrieves the `userShare` for that UUID from
   `/api/wallet/retrieve`. Then it calls `setUserShare` on the `para` instance and claims ownership via
   `claimPregenWallets`.

## Code Highlights

- **`src/app/page.tsx`** – Main UI flow. Demonstrates step-by-step instructions for generating and claiming a wallet.
- **`src/app/api/wallet/generate/route.ts`** – Creates a pregen wallet server-side using `@getpara/server-sdk`.
- **`src/app/api/wallet/retrieve/route.ts`** – Retrieves the `userShare` for a specific UUID.
- **`src/lib/store.ts`** – Simple in-memory store to hold wallet data (not suitable for production).

## Common Issues / Troubleshooting

1. **In-memory Store** – This demo uses a global in-memory store. In a production setting, you’d use a database or other
   persistent storage so that data is not lost or inconsistent across serverless invocations or restarts.
2. **Environment Variables** – Ensure both `NEXT_PUBLIC_PARA_API_KEY` and `PARA_API_KEY` are set.
3. **Authentication** – Make sure you’re logged out before generating a new pregen wallet to avoid mixing user states.

---

For more details, check out:

- [Para Docs](https://docs.getpara.com/)
- [Next.js Documentation](https://nextjs.org/docs)

Happy coding with Para!

```

```
