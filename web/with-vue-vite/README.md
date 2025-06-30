# Para Web SDK + Vue + Vite Example

This example demonstrates how to integrate the Para Web SDK within a Vue.js application built with Vite. The example showcases wallet authentication, connection management, and message signing functionality using Para's web SDK which provides a framework-agnostic approach to wallet integration.

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
- `vue`: ^3.5.13
- `@vitejs/plugin-vue`: ^5.2.1
- `vite`: ^6.1.0
- `tailwindcss`: 4.0.6
- `typescript`: ~5.7.2
- `vite-plugin-node-polyfills`: 0.23.0

## Key Files

- `/src/lib/para/client.ts` - Para Web SDK client initialization
- `/src/composables/useParaAccount.ts` - Vue composable for account management
- `/src/composables/useParaAuth.ts` - Vue composable for authentication
- `/src/components/AuthModal.vue` - Authentication modal component
- `/src/components/WalletDisplay.vue` - Wallet information display component
- `/src/components/auth/` - Authentication UI components (email, phone, social auth)

## Learn More

- [Para SDK Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [Vue.js Documentation](https://vuejs.org)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)