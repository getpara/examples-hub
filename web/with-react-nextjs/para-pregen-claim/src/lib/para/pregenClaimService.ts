import type { GenerateWalletResponse, GetWalletShareResponse } from "./types";

export type StoredPregenWallet = {
  claimEmail: string;
  customId: string;
  encryptedUserShare: string;
  walletAddress: string | null;
  walletId: string;
  paraIdentifier: string;
  paraIdentifierType: "CUSTOM_ID" | "EMAIL";
};

export type PregenWalletStore = {
  getByEmail: (email: string) => Promise<StoredPregenWallet | null>;
  save: (wallet: StoredPregenWallet) => Promise<void>;
  markIdentifierUpdated: (email: string, identifier: string, identifierType: "EMAIL") => Promise<void>;
};

export type PregenWalletClient = {
  createPregenWallet: (params: { type: "EVM"; pregenId: { customId: string } }) => Promise<{
    id: string;
    address?: string;
  }>;
  getUserShare: () => string | null | undefined;
  updatePregenWalletIdentifier: (params: { walletId: string; newPregenId: { email: string } }) => Promise<void>;
};

export type PregenClaimServiceDependencies = {
  para: PregenWalletClient;
  store: PregenWalletStore;
  encrypt: (value: string) => Promise<string>;
  decrypt: (value: string) => Promise<string>;
  generateCustomId: () => string;
};

export async function generatePregenWalletForEmail(
  input: { email: string },
  dependencies: PregenClaimServiceDependencies,
): Promise<GenerateWalletResponse> {
  const email = normalizeEmail(input.email);
  const existingWallet = await dependencies.store.getByEmail(email);

  if (existingWallet) {
    return toGenerateWalletResponse(existingWallet);
  }

  const customId = dependencies.generateCustomId();
  const wallet = await dependencies.para.createPregenWallet({
    type: "EVM",
    pregenId: { customId },
  });
  const userShare = dependencies.para.getUserShare();

  if (!wallet?.id || !userShare) {
    throw new Error("Failed to generate pregen wallet share");
  }

  const storedWallet: StoredPregenWallet = {
    claimEmail: email,
    customId,
    encryptedUserShare: await dependencies.encrypt(userShare),
    walletAddress: wallet.address ?? null,
    walletId: wallet.id,
    paraIdentifier: customId,
    paraIdentifierType: "CUSTOM_ID",
  };

  await dependencies.store.save(storedWallet);

  return toGenerateWalletResponse(storedWallet);
}

export async function preparePregenWalletClaim(
  input: { email: string },
  dependencies: PregenClaimServiceDependencies,
): Promise<GetWalletShareResponse> {
  const email = normalizeEmail(input.email);
  const storedWallet = await dependencies.store.getByEmail(email);

  if (!storedWallet) {
    return { success: true, userShare: null };
  }

  if (storedWallet.paraIdentifierType !== "EMAIL" || storedWallet.paraIdentifier !== email) {
    await dependencies.para.updatePregenWalletIdentifier({
      walletId: storedWallet.walletId,
      newPregenId: { email },
    });
    await dependencies.store.markIdentifierUpdated(email, email, "EMAIL");
  }

  const userShare = await dependencies.decrypt(storedWallet.encryptedUserShare);

  return {
    success: true,
    userShare: rewriteUserShareIdentifier(userShare, storedWallet.walletId, email),
    walletId: storedWallet.walletId,
    customId: storedWallet.customId,
  };
}

function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("A valid email is required");
  }

  return normalizedEmail;
}

function toGenerateWalletResponse(wallet: StoredPregenWallet): GenerateWalletResponse {
  return {
    success: true,
    email: wallet.claimEmail,
    customId: wallet.customId,
    wallet: {
      id: wallet.walletId,
      address: wallet.walletAddress ?? undefined,
    },
  };
}

function rewriteUserShareIdentifier(userShare: string, walletId: string, email: string): string {
  return userShare
    .split("-")
    .map((encodedWallet) => {
      const wallet = JSON.parse(Buffer.from(encodedWallet, "base64").toString()) as Record<string, unknown>;

      if (wallet.id !== walletId) {
        return encodedWallet;
      }

      return Buffer.from(
        JSON.stringify({
          ...wallet,
          pregenIdentifier: email,
          pregenIdentifierType: "EMAIL",
        }),
      ).toString("base64");
    })
    .join("-");
}
