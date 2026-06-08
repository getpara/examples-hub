# Custom Email Auth

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-email-auth.vercel.app)

This example shows a custom Para email OTP authentication flow in a Next.js app. It uses Para React SDK hooks directly instead of ParaModal so the email auth logic can be copied into an app with its own UI.

## Setup

Create `.env`:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with email login availability, 2FA policy, app display name, branding, and auth layout.

Install and run the production server:

```bash
yarn install
yarn build
yarn start
```

## Key Files

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CustomEmailAuthExample.tsx
│   ├── CustomEmailAuthPreview.tsx
│   ├── ParaProvider.tsx
│   ├── layout/Header.tsx
│   └── ui/
│       ├── EmailAuth.tsx
│       ├── EmailForm.tsx
│       ├── VerifyIframe.tsx
│       ├── WalletInfo.tsx
│       └── SignMessage.tsx
└── hooks/
    ├── useEmailAuth.ts
    ├── useParaSession.ts
    └── useSignHelloWorld.ts
```

`src/hooks/useEmailAuth.ts` contains the copyable Para email auth logic. `src/components/ui/*` is prop-driven presentation and has no Para, Wagmi, or Viem imports.

## Core Email Hook

```tsx
const auth = useEmailAuth();

return (
  <EmailAuth
    email={auth.email}
    error={auth.error}
    isPending={auth.isPending}
    onCancel={auth.cancel}
    onEmailChange={auth.setEmail}
    onSubmit={auth.submit}
    step={auth.step}
    verifyUrl={auth.verifyUrl}
  />
);
```

`useEmailAuth` starts email auth with `useSignUpOrLogIn`, renders the returned verification iframe URL, and waits for login or wallet creation with `useWaitForLogin` and `useWaitForWalletCreation`.

## Connected Wallet Hooks

`useParaSession` reads the connected wallet state and exposes `disconnect`. `useSignHelloWorld` creates a Para Viem client for Sepolia and signs a message with `useParaViemSignMessage`.

## Dependency Notes

This example uses `@getpara/react-sdk@3.0.0` with Next.js 16 and React 19. Because the current catch-all SDK entry evaluates chain and account-abstraction barrels during production builds, the example includes the build-reachable modules `@metamask/delegation-toolkit`, `ethers`, `@stellar/stellar-sdk`, and `@wagmi/core` directly until the SDK export surface is narrowed.

The remaining install warnings are expected from shared wallet packages that still peer on Wagmi Core v2 or optional React Native packages.
