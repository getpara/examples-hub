import "server-only";

import { WalletSDKImpl, localNetAuthDefault, LedgerController } from "@canton-network/wallet-sdk";
import { pino } from "pino";

const logger = pino({ name: "signer-canton-network", level: "info" });

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
}

let sdkPromise: Promise<WalletSDKImpl> | null = null;

export function getSdk(): Promise<WalletSDKImpl> {
  if (sdkPromise) return sdkPromise;

  const ledgerApiUrl = envOrThrow("LEDGER_API_URL");
  const validatorApiUrl = envOrThrow("VALIDATOR_API_URL");
  const validatorAudience = envOrThrow("VALIDATOR_AUDIENCE");
  const userId = process.env.AUTH_USER_ID || "ledger-api-user";
  const adminId = process.env.AUTH_ADMIN_ID || userId;
  const unsafeSecret = envOrThrow("AUTH_UNSAFE_SECRET");

  const authFactory = () => {
    // canton-network/wallet-sdk@0.21.x does not export types for the auth
    // controller properties below. Remove these casts once the SDK ships
    // typed config for localNetAuthDefault.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authController = localNetAuthDefault(logger as any);
    authController.userId = userId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (authController as any).adminId = adminId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (authController as any).audience = validatorAudience;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (authController as any).unsafeSecret = unsafeSecret;
    return authController;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ledgerFactory = (uid: string, authTokenProvider: any, isAdmin: boolean) =>
    new LedgerController(uid, new URL(ledgerApiUrl), undefined, isAdmin, authTokenProvider);

  sdkPromise = (async () => {
    const sdk = new WalletSDKImpl().configure({
      logger,
      authFactory,
      ledgerFactory,
    });

    await sdk.connect();
    await sdk.connectAdmin();
    await sdk.connectTopology(new URL(validatorApiUrl));

    return sdk;
  })().catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}
