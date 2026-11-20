# Para Passkey — Expo

Expo React Native example demonstrating Para's passkey authentication. Users identify via email, phone, or Google/Apple OAuth, then authenticate with a native device biometric (Face ID, fingerprint). No browser is opened for the passkey step — the OS handles it directly.

**Expo Go will not work.** Para's SDK includes native modules that require a development build.

Full documentation: [docs.getpara.com](https://docs.getpara.com)

## Setup

```bash
yarn install
```

Create `.env.local` with your API key from [developer.getpara.com](https://developer.getpara.com):

```
EXPO_PUBLIC_PARA_API_KEY=your_api_key_here
```

Build and run:

```bash
yarn prebuild
yarn ios
```

### Associated Domains (Required for Passkeys)

The `app.json` includes `associatedDomains` for iOS passkey support:

```json
"ios": {
  "associatedDomains": ["webcredentials:app.beta.usecapsule.com"]
}
```

This links your app to Para's relying party domain for WebAuthn credential creation.

## How It Works

### Authentication

The client opts into the current sign-in flow with `supportsAuthV2: true` (`lib/para.ts`). The hooks handle signup/login detection, session polling, and wallet creation:

```tsx
const { authenticateWithEmailOrPhoneAsync } = useAuthenticateWithEmailOrPhone();

await authenticateWithEmailOrPhoneAsync({ auth: { email } });
```

For OAuth, pass `appScheme: APP_SCHEME` so the hosted OAuth page returns to the app.

### Email/Phone Code

Every email/phone sign-in starts on a Para-hosted page (`authStateInfo.verificationUrl`) that sends and checks the code, then signs the user in or creates their account. Open it with `openAuthUrl`, which adds the app's `nativeCallbackUrl`.

### Native Passkey

Passkeys use the device's native biometric module, so the hosted page hands the passkey step back to the app:

```tsx
const para = useClient() as ParaMobile;

para.onStatePhaseChange(async ({ authStateInfo }) => {
  // New account: create its passkey once the code (or OAuth) is proven
  if (authStateInfo.isCredentialSetup && authStateInfo.passkeyId) {
    await para.registerPasskey(authStateInfo.passkeyId);
  } else if (authStateInfo.verificationUrl) {
    await openAuthUrl(authStateInfo.verificationUrl);
  }
});

// Returning account: prove its passkey after the code; the pending login then resolves
para.onPasskeyLoginRequired(() => {
  dismissAuthSession();
  para.loginWithPasskey();
});
```

`registerPasskey` triggers the OS passkey creation prompt. `loginWithPasskey` triggers the OS passkey authentication prompt.

## Project Structure

```
app/_layout.tsx         → ParaProvider + QueryClientProvider
app/index.tsx           → Auth screen (email/phone/OAuth → passkey)
app/home.tsx            → Wallet display + logout
lib/para.ts             → ParaMobile client singleton
lib/auth.ts             → openAuthUrl helper (OAuth and email/phone code pages), validation
lib/constants.ts        → App scheme
components/AuthViews.tsx → Presentational auth components
```

## Notes

- Uses Para's **BETA** environment. Change to `Environment.PRODUCTION` for production.
- `disableWorkers: true` is required — React Native does not support Web Workers.
- `associatedDomains` must match your Para environment (`app.beta.usecapsule.com` for beta, `app.usecapsule.com` for production).
- Passkey and password/PIN are configured per API key — the same app code works for any auth type by changing the API key.
