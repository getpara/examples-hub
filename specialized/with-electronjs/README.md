# Electron Desktop App with Para

This example demonstrates how to integrate Para SDK in an Electron desktop application using Vite, React, and TypeScript. It showcases wallet connection and message signing within a native desktop environment with proper security configurations.

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
- `electron` (v37.1.0) - Cross-platform desktop application framework
- `@electron-forge/cli` (v7.8.1) - Electron build and packaging tools
- `vite` (v5.4.19) - Fast build tool with hot module replacement
- `react` (v19.1.0) - React library
- `react-dom` (v19.1.0) - React DOM library

## Key Files

- `src/main.ts` - Electron main process with CSP configuration
- `src/context/ParaProvider.tsx` - Para SDK React context provider
- `src/context/QueryProvider.tsx` - TanStack Query provider configuration
- `src/app/App.tsx` - Main React application component
- `src/renderer.tsx` - Renderer process entry point
- `forge.config.ts` - Electron Forge configuration

## Development

### Running the Application

Start the development server:

```bash
# npm
npm start

# yarn
yarn start

# pnpm
pnpm start
```

### Type Checking

Run TypeScript type checking:

```bash
# npm
npm run typecheck

# yarn
yarn typecheck

# pnpm
pnpm typecheck
```

### Linting

Run ESLint:

```bash
# npm
npm run lint

# yarn
yarn lint

# pnpm
pnpm lint
```

## Building and Packaging

### Create Distributable

Package the application for your current platform:

```bash
# npm
npm run make

# yarn
yarn make

# pnpm
pnpm make
```

This will create platform-specific installers in the `out` directory.

### Create Unpacked Build

For testing purposes, you can create an unpacked build:

```bash
# npm
npm run package

# yarn
yarn package

# pnpm
pnpm package
```

## Security Configuration

This example includes important security configurations:

### Content Security Policy (CSP)

The main process configures CSP headers to allow:
- Para API endpoints (`https://*.getpara.com`, `https://api.beta.usecapsule.com`)
- WebSocket connections for real-time features
- Stripe integration for payment processing
- Required fonts and styles

### Electron Security Best Practices

- Context isolation is enabled
- Node integration is disabled in renderer
- Sandbox mode is enabled
- Preload scripts are used for secure IPC communication

## Architecture

### Directory Structure

```
src/
├── app/          # Main application components
├── context/      # React context providers
├── components/   # Reusable UI components
├── config/       # Configuration files
├── styles/       # Global styles
├── lib/          # Utility libraries
├── types/        # TypeScript type definitions
├── main.ts       # Electron main process
├── preload.ts    # Preload script
└── renderer.tsx  # Renderer process entry
```

### Process Model

- **Main Process**: Handles window creation, CSP configuration, and system-level operations
- **Renderer Process**: Runs the React application with Para SDK integration
- **Preload Script**: Provides secure bridge between main and renderer processes

## Troubleshooting

### Common Issues

1. **Blank window on startup**
   - Check the console for errors (View → Toggle Developer Tools)
   - Ensure `.env.local` is properly configured with your API key

2. **Build failures**
   - Clear node_modules and reinstall: `rm -rf node_modules && yarn install`
   - Ensure you have the correct Node.js version (16+)

3. **CSP violations**
   - Check the main.ts file for CSP configuration
   - Ensure all required domains are whitelisted

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Forge Documentation](https://www.electronforge.io)
- [Vite Documentation](https://vitejs.dev)