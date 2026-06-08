# Custom Phone Auth

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-phone-auth.vercel.app)

This example shows how to build your own phone authentication UI with Para's React SDK hooks in a Next.js app. The copyable phone auth logic lives in hooks, while the UI components stay prop-driven so you can reuse the auth flow without copying this example's styling.

## Features

- Phone number input with country code selection
- Embedded Para verification iframe for SMS OTP completion
- Automatic wallet creation for new users
- Returning-user login completion
- EVM message signing after authentication
- Server-rendered first screen plus hydrated Para runtime
- Clean separation between SDK logic and presentation components

## Setup

Create a local `.env` file:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) for the selected environment with the app display name, branding, phone login availability, 2FA policy, and auth layout. This example keeps the phone input and verification iframe behavior in code, but leaves persistent Para app configuration in the Portal.

Install and run the production build:

```bash
yarn install
yarn build
yarn start
```

## Key Files

```text
src/
├── app/
│   ├── layout.tsx                     # Root layout, metadata, SDK styles
│   └── page.tsx                       # Server page with preview + client runtime
├── components/
│   ├── CustomPhoneAuthExample.tsx     # Client orchestration and provider placement
│   ├── CustomPhoneAuthPreview.tsx     # Server-rendered disconnected first screen
│   ├── ParaProvider.tsx               # Para SDK provider setup
│   ├── layout/Header.tsx              # Prop-only header
│   └── ui/                            # Prop-only auth, wallet, and signing UI
├── constants/auth.ts                  # Country code options
├── hooks/
│   ├── usePhoneAuth.ts                # Copyable phone auth flow
│   ├── useParaSession.ts              # Para session state and logout
│   └── useSignHelloWorld.ts           # Message signing logic
└── types/auth.ts                      # UI-facing auth option types
```

## Hook Contract

`usePhoneAuth` owns the Para SDK calls for the phone auth flow, verification iframe URL, and login completion:

```tsx
const {
  countryCode,
  phoneNumber,
  setCountryCode,
  setPhoneNumber,
  step,
  submit,
  verifyUrl,
} = usePhoneAuth();
```

The presentation components do not import Para, Wagmi, or Viem. They receive only state and callbacks from `CustomPhoneAuthExample`.

## Para SDK Hooks Used

| Hook | Purpose |
| --- | --- |
| `useSignUpOrLogIn` | Starts phone authentication |
| `useWaitForWalletCreation` | Waits for first-time wallet creation |
| `useWaitForLogin` | Waits for returning-user login completion |
| `useAccount` | Reads connection state |
| `useWallet` | Reads the connected wallet address |
| `useLogout` | Disconnects the Para session |
| `useParaViemClient` | Creates a Viem client for the Para wallet |
| `useParaViemSignMessage` | Signs the example message |

## Notes

The example includes direct dependencies that are currently reached by the catch-all Para React SDK build graph, including `@metamask/delegation-toolkit`, `ethers`, `@stellar/stellar-sdk`, and `@wagmi/core`. These keep the production build self-contained until the SDK export boundary can be narrowed.
