# Chrome Extension with Para

This example demonstrates how to integrate Para SDK in a Chrome extension using Vite and React. It showcases wallet connection and authentication within a browser extension popup, utilizing Chrome's storage API for persistence.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_PARA_API_KEY=your_para_api_key
VITE_PARA_ENVIRONMENT=BETA
```

### Installation

Install dependencies using your preferred package manager:

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

## Key Dependencies

- `@getpara/react-sdk` (v2.0.0-alpha.26) - Para React SDK for wallet integration
- `@tanstack/react-query` (v5.81.2) - Data fetching and state management
- `vite` (v6.1.0) - Build tool and development server
- `@vitejs/plugin-react` (v4.3.4) - Vite React plugin
- `@types/chrome` (v0.0.317) - Chrome extension type definitions

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK provider with Chrome storage overrides
- `src/lib/chrome-storage.ts` - Chrome storage implementation for Para SDK
- `src/app/App.tsx` - Main application component with wallet connection
- `src/background.ts` - Chrome extension background script
- `public/manifest.json` - Chrome extension manifest configuration

## Development

### Running in Development Mode

1. Start the development server:

```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

2. Build the extension:

```bash
# npm
npm run build

# yarn
yarn build

# pnpm
pnpm build
```

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select the `dist` folder from your project directory
5. The extension will appear in your extensions list

### Testing the Extension

1. Click the Para extension icon in Chrome's toolbar
2. The popup will open showing the Para authentication interface
3. Click "Open Para Modal" to connect your wallet
4. Once connected, your wallet address will be displayed

### Development Tips

- After making changes, rebuild the extension with `npm run build`
- Click the refresh icon on the extension card in `chrome://extensions/`
- For popup debugging, right-click the extension icon and select "Inspect popup"
- For background script debugging, click "Inspect views: background page" on the extension card

## Chrome Extension Specific Notes

This example uses Chrome's storage API instead of localStorage to persist authentication data across browser sessions. The storage overrides are implemented in `src/lib/chrome-storage.ts` and passed to the Para SDK through the provider configuration.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions)
- [Vite Documentation](https://vitejs.dev)