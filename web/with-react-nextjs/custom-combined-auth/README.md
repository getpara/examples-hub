# Custom Combined Auth

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-custom-combined-auth.vercel.app)

This example shows a custom Para authentication surface for email, phone, and OAuth login in a Next.js app. It uses Para React SDK hooks directly instead of ParaModal so the auth logic can be copied into an app with its own UI.

## Setup

Create `.env`:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) for the selected environment with the app display name, branding, OAuth providers, email and phone login availability, 2FA policy, and auth layout.

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
│   ├── CustomCombinedAuthExample.tsx
│   ├── ParaProvider.tsx
│   ├── layout/Header.tsx
│   └── ui/
│       ├── CombinedAuth.tsx
│       ├── EmailForm.tsx
│       ├── PhoneForm.tsx
│       ├── OAuthButtons.tsx
│       ├── VerifyIframe.tsx
│       ├── WalletInfo.tsx
│       └── SignMessage.tsx
├── hooks/
│   ├── useCombinedAuth.ts
│   ├── useEmailAuth.ts
│   ├── usePhoneAuth.ts
│   ├── useOAuthAuth.ts
│   ├── useParaSession.ts
│   └── useSignHelloWorld.ts
└── constants/auth.ts
```

`src/hooks/*` contains the copyable Para logic. `src/components/ui/*` is prop-driven presentation and has no Para, Wagmi, or Viem imports.

## Core Auth Hook

`useCombinedAuth` composes the email, phone, and OAuth hooks:

```tsx
const auth = useCombinedAuth();

return (
  <CombinedAuth
    activeTab={auth.activeTab}
    countryCodes={COUNTRY_CODES}
    email={auth.email}
    error={auth.error}
    isPending={auth.isPending}
    oauth={auth.oauth}
    onCancel={auth.cancel}
    onTabChange={auth.setActiveTab}
    phone={auth.phone}
    providers={OAUTH_PROVIDERS}
    step={auth.step}
    verifyUrl={auth.verifyUrl}
  />
);
```

Email and phone auth use `useSignUpOrLogIn`, show the returned verification iframe, then call `useWaitForLogin` or `useWaitForWalletCreation` based on the next stage. OAuth auth uses `useVerifyOAuth` or `useVerifyFarcaster`, then waits for login or wallet creation based on whether the user is new.

## Connected Wallet Hooks

`useParaSession` reads the connected wallet state and exposes `disconnect`. `useSignHelloWorld` creates a Para Viem client for Sepolia and signs a message with `useParaViemSignMessage`.

## Dependency Notes

This example uses `@getpara/react-sdk@3.0.0` with Next.js 16 and React 19. Because the current catch-all SDK entry evaluates chain and account-abstraction barrels during production builds, the example includes the build-reachable modules `@metamask/delegation-toolkit`, `ethers`, `@stellar/stellar-sdk`, and `@wagmi/core` directly until the SDK export surface is narrowed.

The remaining install warnings are expected from shared wallet packages that still peer on Wagmi Core v2 or optional React Native packages.
