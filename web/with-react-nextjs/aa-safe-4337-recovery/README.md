# Safe 4337 Recovery Example

[![Live Demo](https://img.shields.io/badge/Live_Demo-black?style=for-the-badge&logo=vercel)](https://para-example-aa-safe-4337-recovery.vercel.app)

A Next.js example showing how Para can act as a recovery guardian for a Safe ERC-4337 account. The demo uses a local EOA as the host passkey-signer simulation so the recovery-module behavior is easy to inspect.

## What This Example Shows

- Configuring `ParaProvider` with full Para authentication
- Creating a Safe ERC-4337 recovery demo flow on Sepolia
- Registering the Para wallet as a SocialRecoveryModule guardian
- Showing that the Para guardian is not a Safe owner and cannot authorize arbitrary spending
- Recovering to a replacement owner after a visible grace period
- Canceling an in-flight recovery before the grace period completes
- Requesting Sepolia funds with `useRequestFaucet`

## Setup

1. Create a `.env` file with the two required keys:

```env
NEXT_PUBLIC_PARA_API_KEY=your_para_api_key
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key
```

Optionally override the default Sepolia RPC URL:

```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

2. Install dependencies:

```bash
yarn install
```

3. Build and run the production server:

```bash
yarn build
yarn start
```

For local development, use `yarn dev`.

4. Open `http://127.0.0.1:3000`.

## Getting API Keys

- **Para API Key**: Get from [Para Developer Portal](https://developer.getpara.com)
- **Pimlico API Key**: Get from [Pimlico Dashboard](https://dashboard.pimlico.io)

## Developer Portal Configuration

Configure the app name, branding, logo, theme, enabled OAuth providers, email and phone login options, 2FA setting, and auth layout on the Para API key in the Developer Portal. This example keeps only runtime modal behavior in code and relies on the Portal for persistent Para app configuration.

The Pimlico API key remains an environment variable because it configures Safe account sponsorship for this example, not Para Portal settings.

## Security Model

The Safe owner is the primary account that signs normal user operations. In this demo that owner is a local EOA labeled as the passkey-signer simulation. Para is registered only as a SocialRecoveryModule guardian, not as a Safe owner.

Safe modules bypass owner signatures once enabled, so module choice matters. This demo uses the SocialRecoveryModule model because it is constrained to owner rotation, has a grace period, and lets the current owner veto a pending recovery. Other enabled modules could change the Safe security story, so production Safes should keep their enabled-module list intentionally small and audited.

The Para guardian trust model is 2-of-2 MPC. A recovery signature is initiated by the host app through the Para-authenticated signer, but it only completes after the user authenticates with Para and Para co-signs. The host app cannot produce that signature by itself, and Para does not have unilateral signing authority without the user's auth ceremony.

Losing the host app passkey is separate from losing access to Para. Para account recovery options, such as email, phone, recovery secret, and 2FA policy, cover the lost-Para-credential chain before the Para wallet can act as the guardian again.

The module can support multiple guardians, guardian thresholds, and different delay periods. This example keeps the configuration to one Para guardian and one guardian signature so the recovery mechanics stay clear.

## Why ERC-4337

Safe ERC-4337 is the production path used here. Safe EIP-7702 support is not used because Safe's 7702 contracts are not the production audited path for this recovery demo.

## Phone And SMS Recovery

Para phone auth can be one way to authenticate the guardian ceremony. This example does not build an SMS iframe flow; it keeps the recovery permission on the Para wallet and shows the host-initiated, Para-verified boundary.

## Related Example

For the standard Para-as-owner Safe flow, see `aa-safe-4337`. This recovery example is the guardian/recovery counterpart.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SafeRecoveryExample.tsx
│   ├── ParaProvider.tsx
│   ├── layout/Header.tsx
│   └── ui/
│       ├── ConnectCard.tsx
│       ├── RecoveryFlow.tsx
│       └── WalletInfo.tsx
├── hooks/
│   ├── safeRecoveryState.ts
│   └── useSafeRecoveryDemo.ts
└── lib/
    ├── safe-4337-client.ts
    ├── safe-recovery-abi.ts
    ├── safe-recovery.ts
    └── social-recovery-actions.ts
```

## Key Integration Pattern

The reusable flow state lives in `src/hooks/useSafeRecoveryDemo.ts`. The Safe and recovery-module contract calls live in `src/lib/` so the UI stays prop-driven while the create, guardian setup, faucet, negative proof, recovery, veto, and finalize steps execute through real Safe/Pimlico/SocialRecoveryModule calls.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Safe ERC-4337 Documentation](https://docs.safe.global/advanced/erc-4337/4337-safe)
- [Safe Modules Documentation](https://docs.safe.global/advanced/smart-account-modules)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
