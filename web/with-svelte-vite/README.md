# Para Web SDK + Svelte + Vite Example

This example demonstrates how to integrate the Para Web SDK within a Svelte application built with Vite. The example showcases comprehensive authentication options including email, phone, and social login methods, along with wallet connection and message signing functionality using Para's framework-agnostic web SDK.

## Setup/Installation

### Environment Variables
Create a `.env` file in the project root and add your Para API key:
```env
VITE_PARA_API_KEY=your_api_key_here
VITE_PARA_ENVIRONMENT=beta
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

### Running the Development Server
```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

## Key Dependencies

- `@getpara/web-sdk`: 2.0.0-alpha.26
- `svelte`: ^5.19.6
- `@sveltejs/vite-plugin-svelte`: ^5.0.3
- `vite`: ^6.1.0
- `tailwindcss`: ^4.1.11
- `typescript`: ~5.7.2
- `vite-plugin-node-polyfills`: 0.23.0

## Key Files

- `/src/lib/para/client.ts` - Para Web SDK client initialization
- `/src/stores/paraAccount.ts` - Svelte store for account state management
- `/src/stores/paraAuth.ts` - Svelte store for authentication state
- `/src/components/AuthModal.svelte` - Authentication modal component
- `/src/components/auth/` - Authentication UI components (email, phone, social auth)
- `/src/components/ui/ConnectWalletCard.svelte` - Wallet connection UI component
- `/src/components/ui/SignMessageForm.svelte` - Message signing functionality

## Learn More

- [Para SDK Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Svelte Documentation](https://svelte.dev)
- [SvelteKit Documentation](https://kit.svelte.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)