# Para Modal

This example demonstrates the simplest integration of Para Modal in a Next.js application. It showcases the basic setup for wallet connection and message signing using Para's built-in modal interface with minimal configuration.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
```

### Installation

Install dependencies using your preferred package manager:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

## Key Dependencies

- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `next` (v15.1.5) - React framework
- `react` (v19.0.0) - React library
- `react-dom` (v19.0.0) - React DOM library

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/components/ui/ConnectWalletCard.tsx` - Wallet connection interface
- `src/components/ui/SignMessageForm.tsx` - Message signing form component
- `src/config/constants.ts` - Configuration constants

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Documentation](https://nextjs.org/docs)
