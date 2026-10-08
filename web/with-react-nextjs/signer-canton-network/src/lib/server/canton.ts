import "server-only";

import {
  LedgerController,
  TokenStandardController,
  UnsafeAuthController,
  ValidatorController,
  WalletSDKImpl,
  localNetStaticConfig,
  type AuthTokenProvider,
  type WalletSDK,
} from "@canton-network/wallet-sdk";
import { pino } from "pino";

const logger = pino({ name: "signer-canton-network", level: "info" });

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var ${key}`);
  return value;
}

let sdkPromise: Promise<WalletSDK> | null = null;

export function getSdk(): Promise<WalletSDK> {
  if (sdkPromise) return sdkPromise;

  const ledgerApiUrl = envOrThrow("LEDGER_API_URL");
  const validatorApiUrl = envOrThrow("VALIDATOR_API_URL");
  const validatorAudience = envOrThrow("VALIDATOR_AUDIENCE");
  const userId = process.env.AUTH_USER_ID || "ledger-api-user";
  const adminId = process.env.AUTH_ADMIN_ID || userId;
  const unsafeSecret = envOrThrow("AUTH_UNSAFE_SECRET");
  const transferFactoryRegistryUrl = process.env.TRANSFER_FACTORY_REGISTRY_URL
    ? new URL(process.env.TRANSFER_FACTORY_REGISTRY_URL)
    : localNetStaticConfig.LOCALNET_REGISTRY_API_URL;

  const authFactory = () => {
    const authController = new UnsafeAuthController(logger);
    authController.userId = userId;
    authController.adminId = adminId;
    authController.audience = validatorAudience;
    authController.unsafeSecret = unsafeSecret;
    return authController;
  };

  const ledgerFactory = (uid: string, authTokenProvider: AuthTokenProvider, isAdmin: boolean) =>
    new LedgerController(uid, new URL(ledgerApiUrl), undefined, isAdmin, authTokenProvider);

  const tokenStandardFactory = (uid: string, authTokenProvider: AuthTokenProvider, isAdmin: boolean) =>
    new TokenStandardController(
      uid,
      new URL(ledgerApiUrl),
      new URL(validatorApiUrl),
      undefined,
      authTokenProvider,
      isAdmin,
    );

  const validatorFactory = (uid: string, authTokenProvider: AuthTokenProvider) =>
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
