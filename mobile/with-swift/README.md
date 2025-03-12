# Para Swift SDK Example App

A simple example app demonstrating Para Swift SDK integration. For detailed setup instructions, see the [official Para documentation](https://docs.getpara.com/getting-started/initial-setup/swift-sdk-setup).

## Quick Start

1. Set required environment variables in Xcode:
   1. Open your scheme settings (Product > Scheme > Edit Scheme or ⌘<)
   2. Select "Run" in the left sidebar
   3. Select the "Arguments" tab
   4. Under "Environment Variables", click "+" to add each variable:

Required variables:
```
PARA_API_KEY=your_api_key_here    # Your Para API key
PARA_ENVIRONMENT=beta             # Options: "dev", "sandbox", "beta", "prod"
```

Optional variables:
```
PARA_RPC_URL                     # Custom RPC URL for EVM operations (defaults to Sepolia testnet)
```

Development-only variables (when PARA_ENVIRONMENT=dev):
```
PARA_DEV_RELYING_PARTY_ID        # Custom relying party ID for dev environment
PARA_DEV_JS_BRIDGE_URL           # Custom JS bridge URL for dev environment
```

2. Open `example.xcodeproj` and run the app

## Features
- User authentication with passkeys
- Wallet management
- EVM signing (using Sepolia testnet)

## Beta Testing Credentials
When using the `beta` environment:
- Email: any address ending in `@test.getpara.com` (e.g. dev@test.getpara.com)
- Phone: US numbers (+1) in format `(area code)-555-xxxx` (e.g. (425)-555-1234)
- Any OTP code will work for verification
 