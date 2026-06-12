# Safe Recovery Custom Auth Example

[Live Demo](https://para-example-aa-safe-4337-recovery-custom-auth.vercel.app)

A minimal Next.js example that uses an app-owned passkey auth UI, a direct Para web client, and a Para wallet as the recovery guardian for a Safe ERC-4337 account on Sepolia.

## What This Example Shows

- Creating a `ParaWeb` client without the React provider or hosted modal
- Managing email verification, OTP entry, and passkey portal URLs from custom UI
- Turning the authenticated Para EVM wallet into a viem signer
- Registering that Para signer as a Safe SocialRecoveryModule guardian
- Proving the guardian cannot spend as an owner
- Starting, vetoing, and finalizing a Safe owner recovery

## Setup

1. Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_PARA_API_KEY=your_passkey_evm_para_api_key_here
NEXT_PUBLIC_PARA_ENVIRONMENT=BETA
NEXT_PUBLIC_PIMLICO_API_KEY=your_pimlico_api_key_here
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

2. Install dependencies:

```bash
yarn install
```

3. Run the app:

```bash
yarn dev
```

4. Open `http://127.0.0.1:3000`.

## Developer Portal Configuration

Use a passkey-capable EVM API key from the [Para Developer Portal](https://developer.getpara.com). Enable passkey authentication and EVM wallet creation for the key. The example owns the visible auth UI, while Para portal URLs handle the secure verification and passkey ceremony.

The Pimlico API key comes from the [Pimlico Dashboard](https://dashboard.pimlico.io) and is used for sponsored Safe ERC-4337 owner operations.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── SafeRecoveryCustomAuthExample.tsx
│   ├── layout/Header.tsx
│   └── ui/
│       ├── AuthCard.tsx
│       ├── RecoveryFlow.tsx
│       ├── VerifyIframe.tsx
│       └── WalletInfo.tsx
├── hooks/
│   ├── safeRecoveryState.ts
│   ├── useCustomParaAuth.ts
│   └── useSafeRecoveryDemo.ts
└── lib/
    ├── para.ts
    ├── safe-4337-client.ts
    ├── safe-recovery-abi.ts
    ├── safe-recovery.ts
    └── social-recovery-actions.ts
```

## Key Integration Pattern

`useCustomParaAuth` owns the SDK client and exposes the authenticated EVM wallet:

```tsx
const para = new ParaWeb(Environment.BETA, paraApiKey);

await para.init();
await para.setup();

const authState = await para.signUpOrLogIn({
  auth: { email },
  useShortUrls: true,
});

if (authState.stage === "verify" && !authState.loginUrl) {
  const signupState = await para.verifyNewAccount({
    verificationCode,
    useShortUrls: true,
  });

  setPasskeyUrl(signupState.passkeyUrl);
  await para.waitForWalletCreation({ isCanceled });
  return;
}

if (authState.stage === "login") {
  setPasskeyUrl(authState.passkeyUrl);
  const loginResult = await para.waitForLogin({ isCanceled });
  if (loginResult.needsWallet) {
    await para.waitForWalletCreation({ isCanceled });
  }
}
```

`useSafeRecoveryDemo` turns that wallet into the Safe recovery guardian signer:

```tsx
const guardianAccount = createParaViemAccount({
  para,
  address: guardianWalletAddress,
});

await confirmRecoveryWithGuardian({
  safe,
  guardianAccount,
  safeAddress,
  newOwnerAddress,
});
```

The Safe owner remains separate from the Para guardian. Normal sponsored user operations are signed by the simulated owner, while the Para guardian can only use the SocialRecoveryModule path.

## Related Examples

- `custom-email-auth` shows a custom email auth surface using React hooks.
- `aa-safe-4337` shows Para as the Safe owner for sponsored transactions.
- `aa-safe-4337-recovery` shows the same recovery flow using the default React provider and modal.

## Learn More

- [Para Documentation](https://docs.getpara.com)
- [Safe ERC-4337 Documentation](https://docs.safe.global/advanced/erc-4337/4337-safe)
- [Safe Modules Documentation](https://docs.safe.global/advanced/smart-account-modules)
- [EIP-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
