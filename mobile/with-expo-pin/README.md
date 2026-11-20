# Para PIN — Expo

Expo React Native example demonstrating Para's PIN authentication. Users identify via email, phone, or Google/Apple OAuth, then create or enter a PIN in Para's hosted portal (opened in an in-app browser).

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

### Authentication

The client opts into the current sign-in flow with `supportsAuthV2: true` (`lib/para.ts`). The hooks handle the entire flow in a single call:

```tsx
const { authenticateWithEmailOrPhoneAsync } = useAuthenticateWithEmailOrPhone();

await authenticateWithEmailOrPhoneAsync({
  auth: { email },
  sessionPollingCallbacks: { isCanceled: () => canceledRef.current },
});
```

For OAuth, pass `appScheme: APP_SCHEME` so the hosted OAuth page returns to the app.

### Hosted Pages

Every email/phone sign-in starts on a Para-hosted page (`verificationUrl`) that sends and checks the code, then signs the user in (a returning user enters their PIN there) or creates their account. A new account then gets a `pinUrl` to set its PIN. Open each in an in-app browser:

```tsx
const para = useClient();

para.onStatePhaseChange(async ({ authStateInfo }) => {
  const url = authStateInfo.verificationUrl ?? authStateInfo.pinUrl;
  if (url) {
    const result = await openAuthUrl(url);
    if (!result.success) canceledRef.current = true; // User dismissed browser
  }
});
```

After each page, the browser redirects back via deep link and the SDK finalizes the session.

## Project Structure

```
app/_layout.tsx         → ParaProvider + QueryClientProvider
app/index.tsx           → Auth screen (email/phone/OAuth → PIN portal)
app/home.tsx            → Wallet display + logout
lib/para.ts             → ParaMobile client singleton
lib/auth.ts             → openAuthUrl helper, validation
lib/constants.ts        → App scheme
components/AuthComponents.tsx → Presentational auth components
```

## Notes

- Uses Para's **BETA** environment. Change to `Environment.PRODUCTION` for production.
- `disableWorkers: true` is required — React Native does not support Web Workers.
- The `scheme` in `app.json` must match `APP_SCHEME` in `lib/constants.ts` for deep link redirects.
- PIN and password are mutually exclusive — configured per API key on [developer.getpara.com](https://developer.getpara.com).
