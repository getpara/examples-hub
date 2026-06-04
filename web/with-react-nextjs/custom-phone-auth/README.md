# Custom Phone Auth

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-phone-auth.vercel.app)

This example demonstrates how to implement custom phone authentication with Para SDK in a Next.js application. It shows the minimal setup needed to build your own phone auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- Custom phone input with country code selection
- Embedded iframe for seamless SMS verification
- Automatic polling for login/wallet creation completion
- Message signing with "Hello World!" example
- **Clean separation of logic (hooks) and presentation (components)**

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Use an API key from the matching Para environment. `NEXT_PUBLIC_PARA_ENVIRONMENT` defaults to `BETA` if omitted and can be set to `SANDBOX` or `PROD` when using keys from those environments.

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding, phone login availability, 2FA policy, and auth layout. This example keeps custom phone auth UI and verification iframe behavior in code, but leaves persistent Para app configuration in the Portal.

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
│  │ usePhoneAuth                                        │    │
│  │ - Manages phone/country state, verification flow    │    │
│  │ - Handles Para SDK interactions                     │    │
│  │ - Returns state + actions                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  COMPONENTS (Presentation Layer - UI Only)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │ PhoneForm   │ │VerifyIframe│ │ AuthCard            │    │
│  │ (props only)│ │(props only) │ │ (layout wrapper)    │    │
│  └─────────────┘ └─────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

```
src/
├── hooks/
│   ├── usePhoneAuth.ts       # Phone auth logic (copy this for your own UI)
│   └── useSignHelloWorld.ts  # Message signing logic
├── constants/
│   └── auth.ts               # Country codes configuration
├── components/
│   ├── ParaProvider.tsx      # Para SDK provider setup
│   ├── layout/Header.tsx     # Header with wallet display
│   └── ui/
│       ├── PhoneAuth.tsx     # Container (connects hook to UI)
│       ├── PhoneForm.tsx     # Presentational (phone input form)
│       ├── VerifyIframe.tsx  # Presentational (OTP verification)
│       ├── AuthCard.tsx      # Presentational (layout wrapper)
│       ├── WalletInfo.tsx    # Connected wallet info
│       └── SignMessage.tsx   # Message signing UI
└── app/
    ├── layout.tsx            # Root layout with ParaProvider
    └── page.tsx              # Main page with auth flow
```

## usePhoneAuth Hook

The `usePhoneAuth` hook encapsulates all phone authentication logic:

```tsx
const {
  // State
  countryCode,     // Current country code (e.g., "+1")
  phoneNumber,     // Current phone number
  step,            // "input" | "verify"
  verifyUrl,       // URL for OTP iframe
  error,           // Error message if any
  isPending,       // Loading state

  // Actions
  setCountryCode,  // Update country code
  setPhoneNumber,  // Update phone number
  submit,          // Start auth flow
  cancel,          // Cancel verification
} = usePhoneAuth();
```

**Copy this hook** to implement phone auth with your own UI components.

## How It Works

1. **PhoneAuth Container** - Connects `usePhoneAuth` hook to presentational components
2. **PhoneForm** - Renders phone input with country selector, calls `onSubmit` when user submits
3. **Verification Iframe** - Embeds Para verification URL for SMS code entry
4. **Polling** - Hook uses `useWaitForLogin` and `useWaitForWalletCreation` internally

## Para SDK Hooks Used

| Hook | Purpose |
|------|---------|
| `useSignUpOrLogIn` | Initiates phone authentication |
| `useWaitForLogin` | Polls for login completion |
| `useWaitForWalletCreation` | Polls for wallet creation (new users) |
| `useAccount` | Gets connection state |
| `useSignMessage` | Signs messages with the wallet |

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
