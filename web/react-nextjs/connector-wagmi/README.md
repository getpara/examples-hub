# Capsule Modal Example

This repository demonstrates how to integrate [Capsule](https://usecapsule.com/) into a **Next.js** application with a
minimal example of the Capsule Modal. The project scaffolds a minimal Next.js 15.x app that shows how to open and
configure the Capsule Modal for basic user login.

## Features

- **Next.js (App Router)** – Utilizing the latest Next.js version.
- **Capsule Modal** – Provides a user-friendly modal for Capsule authentication flows.

## Prerequisites

1. **Node.js v18+** (or an environment that supports Next.js 15)
2. **yarn** / **npm** / **pnpm** / **bun** – choose your package manager
3. A [Capsule account + API key](https://developer.usecapsule.com/) in **BETA** or **PRODUCTION** environment

## Installation

1. **Clone** or download this repository:

   ```bash
   git clone https://github.com/capsule-org/examples-hub.git
   cd examples-hub/web/react-nextjs/capsule-modal
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
   - Create a `.env` (or `.env.local`) file and set:
     ```bash
     NEXT_PUBLIC_PARA_API_KEY=YOUR_PARA_API_KEY
     ```
   - Make sure to use a valid Capsule API key and environment for `Environment.BETA` or `Environment.PRODUCTION`.

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
labeled **Open Capsule Modal**.

### Files of Interest

- **`src/app/page.tsx`** - Displays a button that, when clicked, opens the Capsule Modal.
- **`src/client/capsule.ts`** - Creates a **CapsuleWeb** instance using your `NEXT_PUBLIC_PARA_API_KEY`.

### Important Packages

- `@usecapsule/react-sdk` – Core React SDK for Capsule.

## Common Issues / Troubleshooting

1. **Hydration Mismatch**: If you see a console warning about hydration failing, it can be due to browser extensions
   injecting attributes.
2. **API Key**: Ensure your `.env` is set up correctly. The `NEXT_PUBLIC_PARA_API_KEY` must be exposed to client code.
3. **Missing `pino-pretty`**: If Next.js complains about `pino-pretty` not found, you can ignore it or install it
   locally. It's used by some underlying libraries for local logging.

---

**Enjoy building with Capsule!** If you have questions or need help, check out:

- [Capsule Docs](https://docs.usecapsule.com/)
- [Next.js Documentation](https://nextjs.org/docs)

Happy coding!
