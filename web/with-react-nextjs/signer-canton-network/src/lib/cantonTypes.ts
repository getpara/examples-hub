import type { LedgerController } from "@canton-network/wallet-sdk";

export type GeneratedParty = Parameters<LedgerController["allocateExternalParty"]>[1];

export type PreparedSubmission = Awaited<ReturnType<LedgerController["prepareSubmission"]>>;
