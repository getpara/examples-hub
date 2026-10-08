import type { Para } from "@getpara/server-sdk";
import type { GenerateWalletResponse, GetWalletShareResponse } from "@/lib/pregenWalletApi";

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
  markIdentifierUpdated: (email: string, encryptedUserShare: string) => Promise<void>;
};

export type PregenWalletClient = Pick<
  Para,
  "createPregenWallet" | "getUserShare" | "setUserShare" | "updatePregenWalletIdentifier"
>;

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

  await dependencies.para.setUserShare(await dependencies.decrypt(storedWallet.encryptedUserShare));

  const needsEmailIdentifier = storedWallet.paraIdentifierType !== "EMAIL" || storedWallet.paraIdentifier !== email;

  if (needsEmailIdentifier) {
    await dependencies.para.updatePregenWalletIdentifier({
      walletId: storedWallet.walletId,
      newPregenId: { email },
    });
  }

  const userShare = dependencies.para.getUserShare();

  if (!userShare) {
    throw new Error("Failed to load pregen wallet share");
  }

  if (needsEmailIdentifier) {
    await dependencies.store.markIdentifierUpdated(email, await dependencies.encrypt(userShare));
  }

  return {
    success: true,
    userShare,
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
