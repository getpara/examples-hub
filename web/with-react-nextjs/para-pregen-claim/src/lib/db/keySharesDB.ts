import { Redis } from "@upstash/redis";
import type { PregenWalletStore, StoredPregenWallet } from "@/lib/para/pregenClaimService";

const WALLET_KEY_PREFIX = "para-pregen-claim";
const WALLET_TTL_SECONDS = 60 * 60;

let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = Redis.fromEnv();
  }

  return redisClient;
}

export async function getWalletByEmail(email: string): Promise<StoredPregenWallet | null> {
  return getRedisClient().get<StoredPregenWallet>(getWalletKey(email));
}

export async function storeWallet(wallet: StoredPregenWallet): Promise<void> {
  await getRedisClient().set(getWalletKey(wallet.claimEmail), wallet, {
    ex: WALLET_TTL_SECONDS,
  });
}

export async function markWalletIdentifierUpdated(
  email: string,
  identifier: string,
  identifierType: "EMAIL",
): Promise<void> {
  const wallet = await getWalletByEmail(email);

  if (!wallet) {
    return;
  }

  await getRedisClient().set(
    getWalletKey(email),
    {
      ...wallet,
      paraIdentifier: identifier,
      paraIdentifierType: identifierType,
    },
    { keepTtl: true, xx: true },
  );
}

export const pregenWalletStore: PregenWalletStore = {
  getByEmail: getWalletByEmail,
  save: storeWallet,
  markIdentifierUpdated: markWalletIdentifierUpdated,
};

function getWalletKey(email: string): string {
  return `${WALLET_KEY_PREFIX}:${email}`;
}
