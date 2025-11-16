# Para SDK + React + TanStack Start Example

This example demonstrates how to integrate the Para React SDK with TanStack Start for server-side rendering capabilities. It showcases wallet connection, message signing, and authentication flows while leveraging TanStack Start's powerful routing and SSR features for optimal performance and SEO.

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

### Building for Production
```bash
# npm
npm run build

# yarn
yarn build

# pnpm
pnpm build
```

## Key Dependencies

- `@getpara/react-sdk`: 2.0.0-alpha.26
- `@tanstack/react-query`: 5.81.2
- `@tanstack/react-router`: ^1.122.0
- `@tanstack/react-start`: ^1.122.0
- `react`: ^19.0.0
- `react-dom`: ^19.0.0
- `vite`: ^6.3.5
- `tailwindcss`: ^3.4.17
- `zod`: ^3.24.2

## Key Files

- `/src/context/ParaProvider.tsx` - Para SDK provider configuration
- `/src/context/QueryProvider.tsx` - React Query provider setup
- `/src/routes/index.tsx` - Main route with wallet connection functionality
- `/src/components/ui/ConnectWalletCard.tsx` - Wallet connection UI component
- `/src/components/ui/SignMessageForm.tsx` - Message signing functionality
- `/src/router.tsx` - TanStack Router configuration
- `/src/config/constants.ts` - Environment configuration and constants

## Learn More

- [Para SDK Documentation](https://docs.getpara.com)
- [Para Website](https://getpara.com)
- [Para Developer Portal](https://developer.getpara.com)
- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack Start Documentation](https://tanstack.com/start)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)