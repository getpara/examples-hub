"use client";

import { useCallback, useEffect, useState } from "react";
// Importing direct from @canton-network/core-tx-visualizer rather than from
// @canton-network/wallet-sdk: the latter pulls in @grpc/grpc-js, which
// requires Node's `fs` and breaks the client-side bundle. The hash function
// itself is built on Web Crypto and is browser-safe.
import { hashPreparedTransaction } from "@canton-network/core-tx-visualizer";
import {
  base58ToBase64,
  useAccount,
  useSignMessage,
  useWallet,
  useWalletState,
} from "@getpara/react-sdk";

export function useCantonOnboarding() {
  const account = useAccount();
  const { data: wallet } = useWallet();
  const { setSelectedWallet } = useWalletState();
  const { signMessageAsync } = useSignMessage();

  // Para provisions an embedded wallet per chain, so a new user may land on EVM
  // by default. Canton external-party onboarding needs the Solana (Ed25519) key,
  // so force-select it once the account is connected.
  useEffect(() => {
    if (account?.isConnected && wallet?.type !== "SOLANA") {
      const solanaWallet = account.embedded.wallets?.find((w) => w.type === "SOLANA");
      if (solanaWallet) {
        setSelectedWallet({ id: solanaWallet.id, type: "SOLANA" });
      }
    }
  }, [account, wallet, setSelectedWallet]);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [multiHash, setMultiHash] = useState<string | undefined>();
  const [partyId, setPartyId] = useState<string | undefined>();

  const [isInstallingPreapproval, setIsInstallingPreapproval] = useState(false);
  const [preapprovalError, setPreapprovalError] = useState<Error | null>(null);
  const [preapprovalHash, setPreapprovalHash] = useState<string | undefined>();
  const [preapprovalUpdateId, setPreapprovalUpdateId] = useState<string | undefined>();

  const isSolanaWallet = wallet?.type === "SOLANA";
  const address = isSolanaWallet ? wallet?.address : undefined;
  const walletId = isSolanaWallet ? wallet?.id : undefined;

  const onboard = useCallback(async () => {
    if (!address || !walletId) {
      setError(new Error("No Para Solana wallet available — connect first."));
      return;
    }

    setIsPending(true);
    setError(null);
    setMultiHash(undefined);
    setPartyId(undefined);

    // Derive a per-user partyHint from the Solana address. In a real app, use
    // any stable per-user identifier (email, account ID). The hint shows up in
    // the partyId and topology logs, so unique values keep things readable.
    const partyHint = `para-${address.slice(0, 8)}`;

    try {
      // Step 1: Ask the server to generate the external party on Canton.
      const generateRes = await fetch("/api/canton/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ solanaAddress: address, partyHint }),
      });
      if (!generateRes.ok) {
        const { error: msg } = (await generateRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg || `generateExternalParty failed (${generateRes.status})`);
      }
      const { multiHash: mh, generatedParty } = (await generateRes.json()) as {
        multiHash: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generatedParty: any;
      };
      setMultiHash(mh);

      // Step 2: Sign the multiHash with the Para-managed Solana key via MPC.
      const signRes = await signMessageAsync({ walletId, messageBase64: mh });
      if (!("signature" in signRes) || !signRes.signature) {
        throw new Error("Para signing was denied or returned no signature");
      }
      const signatureBase64 = signRes.signature;

      // Step 3: Send the signature back so Canton can allocate the party.
      const allocateRes = await fetch("/api/canton/allocate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signatureBase64, generatedParty }),
      });
      if (!allocateRes.ok) {
        const { error: msg } = (await allocateRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg || `allocateExternalParty failed (${allocateRes.status})`);
      }
      const { partyId: pid } = (await allocateRes.json()) as { partyId: string };
      setPartyId(pid);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Canton onboarding failed"));
    } finally {
      setIsPending(false);
    }
  }, [address, walletId, signMessageAsync]);

  const installPreapproval = useCallback(async () => {
    if (!partyId) {
      setPreapprovalError(new Error("Onboard the external party first."));
      return;
    }
    if (!address || !walletId) {
      setPreapprovalError(new Error("No Para Solana wallet available — connect first."));
      return;
    }

    setIsInstallingPreapproval(true);
    setPreapprovalError(null);
    setPreapprovalHash(undefined);
    setPreapprovalUpdateId(undefined);

    try {
      // Step 1: Server prepares a TransferPreapprovalProposal via Canton's
      // generic prepareSubmission / executeSubmission pair — the API every
      // post-onboarding ledger write uses. The Para signing call in step 2 is
      // the only bit identical to onboarding.
      const prepareRes = await fetch("/api/canton/preapproval/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ partyId }),
      });
      if (!prepareRes.ok) {
        const { error: msg } = (await prepareRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg || `prepareSubmission failed (${prepareRes.status})`);
      }
      const { preparedTransactionHash, prepared, commandId } = (await prepareRes.json()) as {
        preparedTransactionHash: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prepared: any;
        commandId: string;
      };

      // Verify the hash the server returned actually matches the bytes of the
      // prepared transaction. Without this, a compromised server could trick
      // Para into signing a hash for a different transaction than the one
      // returned to the client. The check uses Web Crypto under the hood.
      const recomputedHash = await hashPreparedTransaction(
        prepared.preparedTransaction,
        "base64",
      );
      if (recomputedHash !== preparedTransactionHash) {
        throw new Error(
          "Prepared transaction hash mismatch — refusing to sign. The server returned a hash that does not match the prepared transaction bytes.",
        );
      }
      setPreapprovalHash(preparedTransactionHash);

      // Step 2: Para signs the prepared hash — same signMessageAsync call
      // as onboarding, just against a different base64 hash.
      const signRes = await signMessageAsync({
        walletId,
        messageBase64: preparedTransactionHash,
      });
      if (!("signature" in signRes) || !signRes.signature) {
        throw new Error("Para signing was denied or returned no signature");
      }
      const signatureBase64 = signRes.signature;
      const publicKeyBase64 = base58ToBase64(address);

      // Step 3: Server submits the signed prepared transaction.
      const executeRes = await fetch("/api/canton/preapproval/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          partyId,
          prepared,
          signatureBase64,
          publicKeyBase64,
          commandId,
        }),
      });
      if (!executeRes.ok) {
        const { error: msg } = (await executeRes.json().catch(() => ({}))) as { error?: string };
        throw new Error(msg || `executeSubmission failed (${executeRes.status})`);
      }
      const { updateId } = (await executeRes.json()) as { updateId: string };
      setPreapprovalUpdateId(updateId);
    } catch (err) {
      setPreapprovalError(
        err instanceof Error ? err : new Error("Preapproval install failed"),
      );
    } finally {
      setIsInstallingPreapproval(false);
    }
  }, [address, walletId, partyId, signMessageAsync]);

  return {
    onboard,
    address,
    multiHash,
    partyId,
    isPending,
    error,
    installPreapproval,
    isInstallingPreapproval,
    preapprovalError,
    preapprovalHash,
    preapprovalUpdateId,
  };
}
