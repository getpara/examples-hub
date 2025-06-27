# Para Provider TanStack Start Example

This example demonstrates how to integrate Para SDK with TanStack Start for wallet connection and message signing.

## Setup

1. Copy `.env.example` to `.env` and add your Para API key:
   ```
   VITE_PARA_API_KEY=your_api_key_here
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run the development server:
   ```bash
   yarn dev
   ```

## Features

- Connect wallet using Para Modal
- Sign messages with connected wallet
- Built with TanStack Start for server-side rendering
- TypeScript support
- Tailwind CSS for styling