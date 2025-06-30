# Custom Phone Auth

This example demonstrates how to implement custom phone authentication with Para SDK in a Next.js application. It showcases a multi-step authentication flow with phone number input and OTP verification using Para's web SDK directly.

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

- `src/components/PhoneModal.tsx` - Phone authentication modal
- `src/components/PhoneInput.tsx` - Phone number input component
- `src/components/OTPInput.tsx` - OTP verification component
- `src/hooks/useParaAuth.ts` - Custom hook for authentication operations
- `src/hooks/useParaAccount.ts` - Custom hook for account management
- `src/hooks/useParaWallet.ts` - Custom hook for wallet operations
- `src/lib/para/client.ts` - Para client initialization

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Next.js Documentation](https://nextjs.org/docs)
