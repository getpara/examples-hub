# Chrome Extension Example

A Chrome extension built with React and Vite. You sign in with the Para Modal in a full tab once. After that, the toolbar button opens a 400 x 600 popup that shows the account and its Sepolia balance and signs `Hello World!`. Para keeps its session in Chrome storage instead of `localStorage`. All Para SDK usage lives in `src/hooks`, `src/lib/para.ts`, and `src/background.ts`. Everything else is plain React and Tailwind that you can replace with your own UI.

## Setup

Create a local `.env` file:

```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=BETA
```

Configure the API key in the [Para Developer Portal](https://developer.getpara.com) with the app display name, branding and logo, theme, OAuth providers, email and phone login options, and 2FA. The local `ParaProvider` passes the Para client and runtime modal behavior such as on-ramp test mode and recovery step visibility.

Install and build the extension:

```bash
yarn install
yarn build
```

Then load it in Chrome:

1. Open `chrome://extensions/` and turn on Developer mode.
2. Click Load unpacked and select the `dist` folder.
3. Click the extension in the toolbar. Signed out, it opens a tab with the sign-in panel. Signed in, it opens the popup.

After a change, run `yarn build` again and click the reload icon on the extension card. To debug the popup, right-click the toolbar icon and choose Inspect popup. To debug the background script, click the service worker link on the extension card.

`vite.config.ts` adds `vite-plugin-node-polyfills` for the Node.js built-ins that wallet libraries expect, maps `@/` to `src/`, and builds `src/background.ts` as `background.js` next to `index.html`. `public/manifest.json` declares the service worker, the storage permissions, and the Para hosts.

## Para usage

These are the files to copy into your own extension.

| File | What it does |
| --- | --- |
| `src/lib/para.ts` | Creates the `ParaWeb` client with the Chrome storage overrides and starts `para.init()`. It is the only Para import in `src/lib` because the popup and the background script both build their client from it, and they share the session through Chrome storage |
| `src/lib/chromeStorage.ts` | The storage overrides that read and write `chrome.storage.local` and `chrome.storage.session`, and seeds the storage keys the SDK reads on startup |
| `src/background.ts` | On a toolbar click, waits for `para.init()` and calls `para.isFullyLoggedIn()`. Signed in, it opens `index.html` as the popup; otherwise, or on an error, it opens `index.html` in a new tab |
| `src/components/ParaProvider.tsx` | Seeds Chrome storage, then wraps the app in `ParaProvider` with the client from `src/lib/para.ts` and a React Query client |
| `src/hooks/useParaModalWallet.ts` | Opens the modal and reads the connected wallet with `useModal`, `useAccount`, and `useWallet` |
| `src/hooks/useSignHelloWorld.ts` | Signs `Hello World!` with `useSignMessage` |
| `src/hooks/useAccountBalance.ts` | Reads the wallet balance with `useWalletBalance`. The balance appears once the API key has an RPC URL in the Developer Portal |

```tsx
const { address, isConnected, isRestoring, openModal } = useParaModalWallet();
const { sign, message, isPending, errorMessage, signature } = useSignHelloWorld();
const { balance, isLoading, isRefreshing, refresh } = useAccountBalance();
```

`isRestoring` is true while the SDK checks for a saved session. The page shows a loading panel until it settles, then either the sign-in panel or the signed-in view.

`useSignHelloWorld` calls `signMessage({ walletId, messageBase64 })` with the base64 encoded message and returns the signature once the user approves the request in the Para window. The address chip in the header opens the Para Modal for the account and log out.

## Project layout

```text
public/manifest.json             # Extension manifest
src/
├── main.tsx                     # Entry: styles, ParaProvider, and the app
├── background.ts                # Service worker: opens the tab or the popup
├── app/App.tsx                  # Renders the example
├── hooks/                       # Para SDK usage, one concern per hook
├── components/
│   ├── ParaProvider.tsx         # Para setup
│   ├── ChromeExtensionExample.tsx  # Joins the hooks with the UI
│   ├── layout/                  # App shell, header, footer, workbench
│   └── ui/                      # Presentational components, props only
├── lib/                         # Para client, Chrome storage, chain config, formatting, and UI helpers
└── styles/globals.css           # Tailwind theme tokens
```

`index.html` keeps the body at least 400 x 600 so the popup and the Para Modal inside it have room. `main.tsx` imports `globals.css` before `@getpara/react-sdk/styles.css` so the app styles never leak into the modal. Components in `layout/` and `ui/` never import Para. They receive data and callbacks from `ChromeExtensionExample`, so you can swap them for your own design system without touching the hooks.
