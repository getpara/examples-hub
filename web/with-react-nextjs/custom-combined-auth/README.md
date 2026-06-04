# Custom Combined Auth

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-combined-auth.vercel.app)

This example demonstrates how to implement a unified authentication flow combining email, phone, and OAuth with Para SDK in a Next.js application. It shows the pattern for building your own multi-method auth UI using Para's React SDK hooks directly, without using the built-in ParaModal.

## Features

- **Tabbed Auth UI** - Clean switching between Email, Phone, and Social login
- **Email OTP** - One-click email verification
- **Phone OTP** - One-click phone verification with country code selector
- **OAuth Login** - Google, Apple, Discord, and X (Twitter)
- **Automatic wallet creation** for new users
- **Message signing** with "Hello World!" example
- **Clean separation of logic (hooks) and presentation (components)**

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
# Optional. Defaults to BETA.
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) for the selected environment with the app display name, branding, OAuth providers, email and phone login availability, 2FA policy, and auth layout. This example keeps custom auth UI and verification iframe behavior in code, but leaves persistent Para app configuration in the Portal. It does not set theme, external wallet, WalletConnect, or RPC overrides in code.

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
│  ┌─────────────────┐ ┌─────────────────┐ ┌───────────────┐  │
│  │ useEmailAuth    │ │ usePhoneAuth    │ │ useOAuthAuth  │  │
│  │ - email state   │ │ - phone state   │ │ - provider    │  │
│  │ - verify flow   │ │ - verify flow   │ │ - popup flow  │  │
│  └────────┬────────┘ └────────┬────────┘ └───────┬───────┘  │
│           │                   │                  │          │
│           └───────────┬───────┴──────────────────┘          │
│                       ▼                                     │
│           ┌─────────────────────┐                           │
│           │ useCombinedAuth     │ (composes all three)      │
│           │ - tab state         │                           │
│           │ - unified error     │                           │
│           └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  COMPONENTS (Presentation Layer - UI Only)                  │
│  ┌───────────┐ ┌───────────┐ ┌─────────────┐ ┌───────────┐  │
│  │ EmailForm │ │ PhoneForm │ │ OAuthButtons│ │ AuthTabs  │  │
│  │(props only│ │(props only│ │ (props only)│ │(props only│  │
│  └───────────┘ └───────────┘ └─────────────┘ └───────────┘  │
│  ┌─────────────────┐ ┌─────────────────────────────────┐    │
│  │ VerifyIframe    │ │ AuthCard                        │    │
│  │ (props only)    │ │ (layout wrapper)                │    │
│  └─────────────────┘ └─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Key Files

```
src/
├── hooks/
│   ├── useEmailAuth.ts       # Email auth logic
│   ├── usePhoneAuth.ts       # Phone auth logic
│   ├── useOAuthAuth.ts       # OAuth auth logic
│   ├── useCombinedAuth.ts    # Composes all three (copy for multi-auth)
│   └── useSignHelloWorld.ts  # Message signing logic
├── constants/
│   └── auth.ts               # Country codes + OAuth providers config
├── components/
│   ├── ParaProvider.tsx      # Para SDK provider setup
│   ├── layout/Header.tsx     # Header with wallet display
│   └── ui/
│       ├── CombinedAuth.tsx  # Container (connects hook to UI)
│       ├── AuthTabs.tsx      # Presentational (tab switcher)
│       ├── EmailForm.tsx     # Presentational (email input)
│       ├── PhoneForm.tsx     # Presentational (phone input)
│       ├── OAuthButtons.tsx  # Presentational (provider buttons)
│       ├── VerifyIframe.tsx  # Presentational (OTP verification)
│       ├── AuthCard.tsx      # Presentational (layout wrapper)
│       ├── WalletInfo.tsx    # Connected wallet info
│       └── SignMessage.tsx   # Message signing UI
└── app/
    ├── layout.tsx            # Root layout with ParaProvider
    └── page.tsx              # Main page with auth flow
```

## useCombinedAuth Hook

The `useCombinedAuth` hook composes all three auth hooks:

```tsx
const {
  // Tab state
  activeTab,       // "email" | "phone" | "social"
  setActiveTab,    // Switch tabs

  // Individual auth hooks (each has its own state + actions)
  email,           // useEmailAuth return value
  phone,           // usePhoneAuth return value
  oauth,           // useOAuthAuth return value

  // Unified state (derived from active tab)
  step,            // "input" | "verify"
  verifyUrl,       // URL for OTP iframe (email/phone)
  error,           // Error from active auth method
  isPending,       // Loading state from active auth method
  cancel,          // Cancel active auth method
} = useCombinedAuth();
```

**Copy this hook** (or individual auth hooks) to implement your own multi-auth flow.

## How It Works

### Email/Phone Flow (OTP)
```
User enters email/phone → signUpOrLogIn({ auth })
       ↓
step: "verify" → Show iframe with loginFullUrl (loginUrl fallback)
       ↓
User enters OTP in iframe
       ↓
Check nextStage:
  - "signup" → waitForWalletCreation()
  - "login"  → waitForLogin()
       ↓
Done - user authenticated
```

### OAuth Flow (One-Click)
```
User clicks OAuth button → verifyOAuth({ method, onOAuthUrl })
       ↓
Popup opens with the popup URL from onOAuthUrl → User authenticates with provider
       ↓
stage: "done"
       ↓
Check isNewUser:
  - true  → waitForWalletCreation()
  - false → waitForLogin()
       ↓
Done - user authenticated
```

## Para SDK Hooks Used

| Hook | Purpose |
|------|---------|
| `useSignUpOrLogIn` | Email/Phone OTP initiation |
| `useVerifyOAuth` | OAuth popup flow (Google, Apple, etc.) |
| `useVerifyFarcaster` | Farcaster-specific OAuth |
| `useWaitForLogin` | Poll for login completion |
| `useWaitForWalletCreation` | Poll for wallet creation (new users) |
| `useAccount` | Connection state |
| `useSignMessage` | Signs messages with the wallet |

## What Developers Can Copy

1. **Just the hooks** - If you have your own UI
2. **Hooks + Presentational components** - If you want the UI pattern too
3. **Full container** - If you want a drop-in solution

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para React SDK](https://docs.getpara.com/sdk/react)
