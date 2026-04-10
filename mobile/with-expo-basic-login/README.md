# Para Basic Login — Expo

Expo React Native example demonstrating Para's basic login authentication. Users authenticate via email, phone, or Google/Apple OAuth. The portal handles OTP verification entirely — no in-app code input needed.

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

## How It Works

### Entry Point

The shim must load before anything else:

```javascript
// index.js
import '@getpara/react-native-wallet/shim';
import 'expo-router/entry';
```

### Provider Setup

`ParaProvider` wraps the app and handles SDK initialization:

```tsx
// app/_layout.tsx
<QueryClientProvider client={queryClient}>
  <ParaProvider paraClientConfig={para} config={{ appName: 'Para Basic Login' }}>
    <Stack />
  </ParaProvider>
</QueryClientProvider>
```

### Authentication

The `authenticateWithEmailOrPhone` and `authenticateWithOAuth` hooks handle the entire flow — signup/login detection, session polling, and wallet creation — in a single call:

```tsx
const { authenticateWithEmailOrPhoneAsync } = useAuthenticateWithEmailOrPhone();
const { authenticateWithOAuthAsync } = useAuthenticateWithOAuth();

// Email or phone
await authenticateWithEmailOrPhoneAsync({ auth: { email } });

// OAuth (Google, Apple, etc.)
await authenticateWithOAuthAsync({
  method: 'GOOGLE',
  redirectCallbacks: {
    onOAuthUrl: async (url) => await openAuthUrl(url),
  },
});
```

### Portal URLs

For basic login, the SDK generates a `verificationUrl` that you open in an in-app browser. Subscribe to state changes to know when it's ready:

```tsx
const para = useClient();

para.onStatePhaseChange(async (snapshot) => {
  if (snapshot.authPhase === 'awaiting_session_start' && snapshot.authStateInfo.verificationUrl) {
    await openAuthUrl(snapshot.authStateInfo.verificationUrl);
  }
});
```

The `openAuthUrl` helper appends the app scheme for deep link redirect and uses `expo-web-browser`:

```tsx
import { openAuthSessionAsync } from 'expo-web-browser';

export async function openAuthUrl(url: string) {
  const authUrl = new URL(url);
  authUrl.searchParams.set('nativeCallbackUrl', APP_SCHEME);
  const result = await openAuthSessionAsync(authUrl.toString(), APP_SCHEME);
  return { success: result.type === 'success' };
}
```

### Cancellation

If the user dismisses the browser, cancel the polling loop:

```tsx
const canceledRef = useRef(false);

// In the state listener — browser dismissed
const result = await openAuthUrl(url);
if (!result.success) canceledRef.current = true;

// In the auth call
await authenticateWithEmailOrPhoneAsync({
  auth: { email },
  sessionPollingCallbacks: { isCanceled: () => canceledRef.current },
});
```

## Project Structure

```
app/_layout.tsx         → ParaProvider + QueryClientProvider
app/index.tsx           → Auth screen (email/phone/OAuth)
app/home.tsx            → Wallet display + logout
lib/para.ts             → ParaMobile client singleton
lib/auth.ts             → openAuthUrl helper, validation
lib/constants.ts        → App scheme
components/AuthViews.tsx → Presentational auth components
```

## Notes

- Uses Para's **BETA** environment. Change to `Environment.PRODUCTION` for production.
- `disableWorkers: true` is required — React Native does not support Web Workers.
- The `scheme` in `app.json` must match `APP_SCHEME` in `lib/constants.ts` for deep link redirects.
