# Para with Custom Email Auth Example

This example demonstrates a custom email authentication flow using Para's web-sdk with React Query hooks and a multi-step modal UI. It showcases how to build a custom authentication experience without relying on wagmi or other wallet connector libraries.

## Prerequisites

- **Para API Key**: Obtain your API key from the Para developer portal. Create a `.env.local` file in the project root
  (you can copy `.env.example`) and add your key, prefixing with `NEXT_PUBLIC_` to expose it to the browser:
  ```env
  NEXT_PUBLIC_PARA_API_KEY=your_api_key_here
  ```

## Installation

1.  Install project dependencies using your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Example

1.  Start the Next.js development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) (or the port specified) with
    your browser to see the result.

## Features

- **Custom Email Authentication**: Multi-step email authentication flow with OTP verification
- **React Query Integration**: Custom hooks wrapping Para SDK methods for better state management
- **Modal UI**: Clean modal interface matching the connector-wagmi example style
- **Message Signing**: Sign messages with your Para wallet after authentication
- **No Wagmi Dependency**: Demonstrates direct usage of Para's web-sdk without wallet connector libraries

## Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Header)
│   └── AuthModal.tsx      # Multi-step authentication modal
├── context/               # React contexts
│   ├── QueryProvider.tsx  # React Query provider
│   └── ModalContext.tsx   # Modal state management
├── hooks/                 # Custom React hooks
│   ├── useParaAuth.ts     # Authentication operations
│   ├── useParaAccount.ts  # Account state management
│   ├── useParaWallet.ts   # Wallet creation operations
│   └── useParaSignMessage.ts # Message signing
├── lib/para/              # Para SDK setup
├── config/                # Configuration files
└── utils/                 # Utility functions
```

## Learn More

For comprehensive guidance on using the Para SDK, setup details, and advanced features, please refer to the official
documentation:

[Para SDK documentation](https://docs.usepara.com/welcome)
