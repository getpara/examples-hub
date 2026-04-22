"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage, useWallet, useWalletState } from "@getpara/react-sdk";

const PARTY_HINT = "para-external-party";

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

    try {
      // Step 1: Ask the server to generate the external party on Canton.
      const generateRes = await fetch("/api/canton/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ solanaAddress: address, partyHint: PARTY_HINT }),
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

  return {
    onboard,
    address,
    multiHash,
    partyId,
    isPending,
    error,
  };
}
