import "server-only";

import {
  WalletSDKImpl,
  type WalletSDK,
  localNetAuthDefault,
  localNetStaticConfig,
  LedgerController,
  TokenStandardController,
  ValidatorController,
} from "@canton-network/wallet-sdk";
import { pino } from "pino";

const logger = pino({ name: "signer-canton-network", level: "info" });

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
}

// SINGLE-USER DEMO. The cached SDK is fine for a one-user starter, but
// `sdk.setPartyId(partyId)` mutates the same `userLedger` and `tokenStandard`
// controllers in place. Two concurrent requests that call setPartyId for
// different parties will race — one request can submit using another
// request's bound party. For multi-user serving, build per-request
// controllers from the factories below (or wrap setPartyId+prepare+execute
// in a per-process mutex).
let sdkPromise: Promise<WalletSDK> | null = null;

export function getSdk(): Promise<WalletSDK> {
  if (sdkPromise) return sdkPromise;

  const ledgerApiUrl = envOrThrow("LEDGER_API_URL");
  const validatorApiUrl = envOrThrow("VALIDATOR_API_URL");
  const validatorAudience = envOrThrow("VALIDATOR_AUDIENCE");
  const userId = process.env.AUTH_USER_ID || "ledger-api-user";
  const adminId = process.env.AUTH_ADMIN_ID || userId;
  const unsafeSecret = envOrThrow("AUTH_UNSAFE_SECRET");
  // Token-standard transfer commands look up factory + choice context from
  // a registry served via the validator's scan-proxy. Defaults to the SDK's
  // canonical LocalNet URL; override for hosted deployments.
  const transferFactoryRegistryUrl = process.env.TRANSFER_FACTORY_REGISTRY_URL
    ? new URL(process.env.TRANSFER_FACTORY_REGISTRY_URL)
    : localNetStaticConfig.LOCALNET_REGISTRY_API_URL;

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenStandardFactory = (uid: string, authTokenProvider: any, isAdmin: boolean) =>
    new TokenStandardController(
      uid,
      new URL(ledgerApiUrl),
      new URL(validatorApiUrl),
      undefined,
      authTokenProvider,
      isAdmin,
    );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validatorFactory = (uid: string, authTokenProvider: any) =>
    new ValidatorController(uid, new URL(validatorApiUrl), authTokenProvider);

  sdkPromise = (async () => {
    const sdk = new WalletSDKImpl().configure({
      logger,
      authFactory,
      ledgerFactory,
      tokenStandardFactory,
      validatorFactory,
    });

    await sdk.connect();
    await sdk.connectAdmin();
    await sdk.connectTopology(new URL(validatorApiUrl));

    if (sdk.tokenStandard) {
      sdk.tokenStandard.setTransferFactoryRegistryUrl(transferFactoryRegistryUrl);
    }

    return sdk;
  })().catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}
