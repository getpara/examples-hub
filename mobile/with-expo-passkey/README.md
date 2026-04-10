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

The hooks handle signup/login detection, session polling, and wallet creation:

```tsx
const { authenticateWithEmailOrPhoneAsync } = useAuthenticateWithEmailOrPhone();

await authenticateWithEmailOrPhoneAsync({ auth: { email } });
```

### Native Passkey

Unlike password/PIN (which open a portal URL in a browser), passkeys use the device's native biometric module. Subscribe to state changes and call the native methods directly:

```tsx
const para = useClient() as ParaMobile;

para.onStatePhaseChange(async (snapshot) => {
  if (snapshot.authPhase === 'awaiting_session_start') {
    if (snapshot.authStateInfo.isNewUser && snapshot.authStateInfo.passkeyId) {
      await para.registerPasskey(snapshot.authStateInfo.passkeyId);
    } else {
      await para.loginWithPasskey();
    }
  }
});
```

`registerPasskey` triggers the OS passkey creation prompt. `loginWithPasskey` triggers the OS passkey authentication prompt. No URLs, no browser.

### OTP Verification

New users signing up via email/phone must verify with an OTP code before passkey creation. The SDK fires `awaiting_account_verification` — show a code input and call:

```tsx
const { verifyNewAccountAsync } = useVerifyNewAccount();

await verifyNewAccountAsync({ verificationCode: code });
```

## Project Structure

```
app/_layout.tsx         → ParaProvider + QueryClientProvider
app/index.tsx           → Auth screen (email/phone/OAuth → passkey)
app/home.tsx            → Wallet display + logout
lib/para.ts             → ParaMobile client singleton
lib/auth.ts             → openAuthUrl helper (for OAuth URLs), validation
lib/constants.ts        → App scheme
components/AuthViews.tsx → Presentational auth components
```

## Notes

- Uses Para's **BETA** environment. Change to `Environment.PRODUCTION` for production.
- `disableWorkers: true` is required — React Native does not support Web Workers.
- `associatedDomains` must match your Para environment (`app.beta.usecapsule.com` for beta, `app.usecapsule.com` for production).
- Passkey and password/PIN are configured per API key — the same app code works for any auth type by changing the API key.
