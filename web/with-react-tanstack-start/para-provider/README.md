# Para SDK with TanStack Start

This project demonstrates how to integrate Para SDK with TanStack Start while preserving server-side rendering (SSR)
capabilities.

## Installation and Setup

```bash
# Install dependencies
npm install
# or
yarn install
# or
bun install

# Create .env file from example
cp .env.example .env

# Add your Para API key to the .env file
# VITE_PARA_API_KEY=your_api_key
# VITE_PARA_ENVIRONMENT=BETA

# Start the development server
npm run dev
# or
yarn dev
# or
bun dev
```

## Key Implementation Concepts

### Client-side Only Loading

Para SDK components must be loaded client-side only to avoid SSR conflicts with styled components. This is accomplished
using:

1. **React.lazy** for component loading
2. **ClientOnly** component from TanStack to prevent server rendering

```tsx
// Lazy load
const LazyParaProvider = React.lazy(() => import("@getpara/react-sdk").then((mod) => ({ default: mod.ParaProvider })));

// ClientOnly wrapper
<ClientOnly fallback={null}>
  <LazyParaProvider>{children}</LazyParaProvider>
</ClientOnly>;
```

### Node Polyfills Configuration

Para SDK requires node polyfills, but they should only be loaded on the client side:

```ts
// app.config.ts
export default defineConfig({
  // ... other config

  // This applies to both client and server
  vite: {
    plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] })],
    define: {
      "process.browser": true,
    },
  },

  // This applies to client only
  routers: {
    client: {
      vite: {
        plugins: [nodePolyfills()],
      },
    },
  },
});
```

By configuring the node polyfills only in the client router section, we prevent server-side evaluation issues.

## Para API Keys

Get your API keys from [Para Developer Portal](https://developer.getpara.com). Add these to your `.env` file as shown in
the `.env.example`.

## Documentation

For more information about Para SDK usage, refer to the [Para Documentation](https://docs.getpara.com).

## Implementation Details

### Why Client-side Only Loading?

The Para SDK uses styled-components internally which can cause issues during server-side rendering. By using
`React.lazy` and `ClientOnly`, we ensure Para components are only evaluated in the browser environment where
styled-components works correctly.

### Node Polyfills Strategy

We intentionally configure node polyfills only for the client:

```ts
// In app.config.ts
// Base configuration (applied to both client and server)
vite: {
  define: {
    "process.browser": true,
  },
},

// Client-specific configuration
routers: {
  client: {
    vite: {
      plugins: [nodePolyfills()],
    },
  },
},
```

This approach:

- Avoids loading node polyfills on the server where they're unnecessary and can cause conflicts
- Sets `process.browser` to true which helps modules determine the execution environment
- Ensures proper resolution of browser-specific code paths

### Adapting to Your Application

Developers should consider:

- Using `ClientOnly` and lazy loading is recommended for Para components, but your specific architecture may require
  different approaches
- Hydration mismatches can occur if server and client renders don't match - carefully manage component boundaries
- SSR performance tradeoffs - components that require client-side only rendering won't contribute to initial HTML
- Different TanStack Start configurations might require adjustments to the polyfill strategy
