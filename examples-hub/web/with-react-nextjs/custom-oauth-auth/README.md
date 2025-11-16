# Custom OAuth Auth

This example demonstrates how to implement custom OAuth authentication with Para SDK in a Next.js application. It showcases integration with multiple OAuth providers including Google, Twitter, Apple, Discord, Facebook, and Farcaster through Para's web SDK.

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

- `@getpara/web-sdk` (v2.0.0-alpha.26) - Para Web SDK for authentication
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `next` (v15.1.5) - React framework
- `react` (v19.0.0) - React library
- `react-dom` (v19.0.0) - React DOM library

## Key Files

- `src/components/OAuthModal.tsx` - OAuth provider selection modal
- `src/components/OAuthButtons.tsx` - OAuth provider button components
- `src/hooks/useParaOAuth.ts` - Custom hook for OAuth operations
- `src/hooks/useParaAccount.ts` - Custom hook for account management
- `src/hooks/useParaWallet.ts` - Custom hook for wallet operations
- `src/lib/para/client.ts` - Para client initialization
- `public/` - OAuth provider icons (google.svg, twitter.svg, etc.)

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Documentation](https://nextjs.org/docs)
