# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Running the Application
```bash
# Start Metro bundler in development build mode
yarn start

# Run on iOS (requires Xcode)
npx expo run:ios

# Run on Android (requires Android Studio)
npx expo run:android --device
```

## Architecture Overview

### Project Structure
This is an Expo-based React Native application that integrates the Para SDK for multi-chain wallet functionality. The app follows a feature-based architecture with clear separation of concerns.

### Key Architectural Components

1. **Expo Router Navigation**: 
   - File-based routing in `src/app/`
   - Auth flow (`/auth/*`) redirects to home (`/home/*`) after successful authentication
   - Protected routes based on Para client authentication state

2. **Para SDK Integration**:
   - Singleton client instance initialized in `src/client/para.ts`
   - Requires `EXPO_PUBLIC_PARA_API_KEY` environment variable
   - Hook-based API through `src/hooks/usePara.ts`

3. **State Management**:
   - React Query (TanStack Query) for all async state
   - No Context API - all state flows through custom hooks
   - Key hooks: `usePara`, `useWallets`, `useSigners`, `useBalances`, `useTransactions`

4. **Authentication Flow**:
   - Email/Phone with OTP verification
   - OAuth providers (Google, Discord, Twitter, etc.)
   - Passkey/biometric authentication
   - Credentials persisted in Expo Secure Store

5. **Multi-Chain Support**:
   - EVM (Ethereum) wallets via Ethers/Viem
   - Solana wallets via Solana Web3.js
   - Chain-specific providers initialized through `useSigners` hook

### Environment Setup Requirements

1. **Environment Variables**:
   - Create `.env` file with `EXPO_PUBLIC_PARA_API_KEY=your-para-api-key`

2. **Platform-Specific Setup**:
   - iOS: Requires Apple Developer Team ID registered with Para
   - Android: SHA-256 fingerprint must be registered with Para
   - Both platforms require development builds (Expo Go not supported)

3. **Native Dependencies**:
   - React Native Passkey for biometric authentication
   - React Native Quick Crypto for cryptographic operations
   - Various polyfills configured in `metro.config.js`

### Important Patterns

- **Type Safety**: Full TypeScript with typed navigation params
- **Error Handling**: Centralized in hooks with toast notifications
- **Performance**: Lazy loading with React Query, configurable refetch intervals
- **Security**: All credentials stored in secure storage, no hardcoded secrets
- **UI Framework**: NativeWind (Tailwind for React Native) with RN Primitives