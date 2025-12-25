# Custom Email Auth

This example demonstrates how to implement custom email authentication with Para SDK in a Next.js application. It shows the minimal setup needed to build your own email auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- Custom email input and verification flow
- Embedded iframe for seamless OTP verification
- Automatic polling for login/wallet creation completion
- Message signing with "Hello World!" example
- **Clean separation of logic (hooks) and presentation (components)**

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

## Architecture

This example follows the **Smart/Dumb Component Pattern** for clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│  HOOKS (Logic Layer - Reusable)                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ useEmailAuth                                        │    │
│  │ - Manages email state, verification flow            │    │
│  │ - Handles Para SDK interactions                     │    │
│  │ - Returns state + actions                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  COMPONENTS (Presentation Layer - UI Only)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │ EmailForm   │ │VerifyIframe│ │ AuthCard            │    │
│  │ (props only)│ │(props only) │ │ (layout wrapper)    │    │
│  └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

```
src/
├── hooks/
│   ├── useEmailAuth.ts       # Email auth logic (copy this for your own UI)
│   └── useSignHelloWorld.ts  # Message signing logic
├── components/
│   ├── ParaProvider.tsx      # Para SDK provider setup
│   ├── layout/Header.tsx     # Header with wallet display
│   └── ui/
│       ├── EmailAuth.tsx     # Container (connects hook to UI)
│       ├── EmailForm.tsx     # Presentational (email input form)
│       ├── VerifyIframe.tsx  # Presentational (OTP verification)
│       ├── AuthCard.tsx      # Presentational (layout wrapper)
│       ├── WalletInfo.tsx    # Connected wallet info
│       └── SignMessage.tsx   # Message signing UI
└── app/
    ├── layout.tsx            # Root layout with ParaProvider
    └── page.tsx              # Main page with auth flow
```

## useEmailAuth Hook

The `useEmailAuth` hook encapsulates all email authentication logic:

```tsx
const {
  // State
  email,           // Current email value
  step,            // "input" | "verify"
  verifyUrl,       // URL for OTP iframe
  error,           // Error message if any
  isPending,       // Loading state

  // Actions
  setEmail,        // Update email value
  submit,          // Start auth flow
  cancel,          // Cancel verification
} = useEmailAuth();
```

**Copy this hook** to implement email auth with your own UI components.

## How It Works

1. **EmailAuth Container** - Connects `useEmailAuth` hook to presentational components
2. **EmailForm** - Renders email input, calls `onSubmit` when user submits
3. **Verification Iframe** - Embeds Para verification URL for OTP entry
4. **Polling** - Hook uses `useWaitForLogin` and `useWaitForWalletCreation` internally

## Para SDK Hooks Used

| Hook | Purpose |
|------|---------|
| `useSignUpOrLogIn` | Initiates email authentication |
| `useWaitForLogin` | Polls for login completion |
| `useWaitForWalletCreation` | Polls for wallet creation (new users) |
| `useAccount` | Gets connection state |
| `useSignMessage` | Signs messages with the wallet |

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
