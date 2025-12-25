# Custom Email Auth

This example demonstrates how to implement custom email authentication with Para SDK in a Next.js application. It shows the minimal setup needed to build your own email auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- Custom email input and verification flow
- Embedded iframe for seamless OTP verification
- Automatic polling for login/wallet creation completion
- Message signing with "Hello World!" example

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
```

### Installation

```bash
yarn install
yarn dev
```

## Key Files

```
src/
├── app/
│   ├── layout.tsx          # Root layout with ParaProvider
│   └── page.tsx            # Main page with auth flow
├── components/
│   ├── ParaProvider.tsx    # Para SDK provider setup
│   ├── layout/Header.tsx   # Header with wallet display
│   └── ui/
│       ├── EmailAuth.tsx   # Email authentication component
│       ├── WalletInfo.tsx  # Connected wallet info
│       └── SignMessage.tsx # Message signing UI
├── hooks/
│   └── useSignHelloWorld.ts
└── lib/
    └── e2e-helpers.ts
```

## How It Works

1. **EmailAuth Component** - Uses Para's `useSignUpOrLogIn` hook to initiate email auth
2. **Verification Popup** - Opens the Para verification URL in a popup window
3. **Polling** - Uses `useWaitForLogin` and `useWaitForWalletCreation` to detect completion
4. **Connected State** - Once authenticated, displays wallet info and signing functionality

## Key Hooks Used

- `useSignUpOrLogIn` - Initiates email authentication
- `useWaitForLogin` - Polls for login completion
- `useWaitForWalletCreation` - Polls for wallet creation (new users)
- `useAccount` - Gets connection state
- `useSignMessage` - Signs messages with the wallet

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
