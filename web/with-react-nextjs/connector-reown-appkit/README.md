# Reown AppKit + Next.js + Wagmi + Para Example

This example demonstrates how to integrate Reown AppKit with Next.js and Wagmi for wallet connectivity, featuring Para as a custom wagmi connector.

## Features

- 🔗 Connect to 600+ wallets
- 🔐 Email and social login support
- 🌐 Multi-chain support (Ethereum, Arbitrum, Optimism, Polygon, Base)
- 📱 Responsive design
- ⚡ Server-side rendering support
- 🎨 Light theme with Tailwind CSS
- 🔑 **Para Embedded Wallet Integration** - Custom wagmi connector for Para wallet

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory and add your project IDs:

```bash
# Reown Project ID
NEXT_PUBLIC_PROJECT_ID=your_project_id_here

# Para API Key
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key_here
```

- Get your Reown project ID from [https://cloud.reown.com](https://cloud.reown.com)
- Get your Para API key from [Para Dashboard](https://para.io)

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx    # Root layout with AppKit providers
│   ├── page.tsx      # Main page with connect button
│   └── globals.css   # Global styles
├── client/
│   └── para.ts       # Para client initialization
├── components/
│   ├── AppKitProvider.tsx  # AppKit provider wrapper
│   └── WalletDisplay.tsx   # Wallet info display component
├── config/
│   └── appkit.ts     # AppKit configuration with Para connector
└── constants/
    └── chains.ts     # Supported blockchain networks
```

## Key Components

### AppKit Configuration (`src/config/appkit.ts`)
- Initializes AppKit with wagmi adapter
- Configures supported networks
- Sets up metadata and features
- **Integrates Para as a custom wagmi connector**

### AppKitProvider (`src/components/AppKitProvider.tsx`)
- Wraps the app with necessary providers
- Handles SSR with initial state

### WalletDisplay (`src/components/WalletDisplay.tsx`)
- Shows connected wallet information
- Displays address, network, and balance
- Provides disconnect functionality

## Usage

1. Click "Connect Wallet" to open the AppKit modal
2. Choose your preferred connection method:
   - **Para Wallet** - Embedded wallet with email/phone/social login
   - Wallet apps (MetaMask, WalletConnect, etc.)
   - Email login (via Reown)
   - Social login (Google, X, GitHub, Discord, Farcaster)
3. Once connected, view your wallet details
4. Use "Open Account Modal" to access additional features

### Para Wallet Features
When selecting Para from the wallet list:
- Email authentication
- Phone number authentication
- Social logins (Google, Twitter, Discord, Facebook, Farcaster, Apple)
- Embedded wallet - no extension required
- Full wallet recovery options

## Documentation

- [Reown AppKit Docs](https://docs.reown.com/appkit/overview)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)

## License

This example is open source and available under the MIT License.