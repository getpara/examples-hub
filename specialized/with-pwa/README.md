# Progressive Web App with Para

This example demonstrates how to integrate Para SDK in a Progressive Web App (PWA) built with Next.js. It showcases wallet connection and authentication within a PWA context, with offline support for the UI while maintaining secure online authentication.

## Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
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
- `next` (v15.1.5) - React framework with PWA support
- `react` (v19.0.0) - React library
- `react-dom` (v19.0.0) - React DOM library

## Key Files

- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/context/QueryProvider.tsx` - TanStack Query provider configuration
- `src/app/layout.tsx` - Root layout with PWA metadata and service worker registration
- `src/app/page.tsx` - Main page with wallet connection interface
- `public/manifest.json` - PWA manifest configuration
- `public/sw.js` - Service worker for offline functionality

## PWA Features

### Service Worker

The service worker (`public/sw.js`) provides:
- Offline caching for static assets
- Network-first strategy for API calls
- Cache-first strategy for fonts and images

### Manifest

The PWA manifest (`public/manifest.json`) configures:
- App name and icons
- Theme colors
- Display mode (standalone)
- Start URL

## PWA Considerations for Para

### Offline Functionality

- **Important**: Authentication operations require an active internet connection to communicate with Para's servers
- The PWA caches static assets and provides offline UI, but wallet connection must be performed online
- Consider implementing offline detection to provide appropriate user feedback

### Authentication Experience

For the best PWA experience:
- Enable Password authentication in the [Para Developer Portal](https://developer.getpara.com/) for seamless in-app authentication
- Password fields are handled within the web app context rather than triggering native browser dialogs
- This provides a more integrated PWA experience

### Development Tips

1. Test PWA features in production build:
   ```bash
   npm run build && npm run start
   ```

2. Use Chrome DevTools Application tab to:
   - View and test service worker
   - Check manifest configuration
   - Inspect cache storage

3. Test offline functionality:
   - Enable offline mode in DevTools Network tab
   - Verify cached content loads correctly
   - Ensure appropriate error handling for authentication

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Next.js PWA Documentation](https://nextjs.org/docs/app/building-your-application/configuring/progressive-web-apps)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)