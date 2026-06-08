"use client";

import { useState, useCallback } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaCosmjsAminoSigner } from "@getpara/react-sdk/cosmos";
import { useParaSolanaSigner } from "@getpara/react-sdk/solana";
import { useSignMessage as useWagmiSignMessage } from "wagmi";
import { useOfflineSigners } from "graz";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { makeSignDoc, type OfflineAminoSigner } from "@cosmjs/amino";
import { createSolanaRpc } from "@solana/rpc";

const HELLO_WORLD_MESSAGE = "Hello World!";
const CHAIN_ID = "cosmoshub-4";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = createSolanaRpc("https://api.devnet.solana.com" as Parameters<typeof createSolanaRpc>[0]) as any;

export type ChainSignState = {
  chainId: string;
  label: string;
  sign: () => void;
  isPending: boolean;
  errorMessage: string | null;
  signature?: string;
};

type SignState = {
  isPending: boolean;
  errorMessage: string | null;
  signature?: string;
};

type WalletWithType = {
  type?: string;
};

const initialSignState: SignState = {
  isPending: false,
  errorMessage: null,
  signature: undefined,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function useMultichainSign() {
  const { connectionType, embedded, external } = useAccount();

  // EVM hooks
  const { signMessageAsync: wagmiSign } = useWagmiSignMessage();
  const [evmState, setEvmState] = useState<SignState>(initialSignState);

  // Cosmos hooks
  const { aminoSigner: cosmosEmbedded } = useParaCosmjsAminoSigner();
  const { data: grazSigners } = useOfflineSigners();
  const [cosmosState, setCosmosState] = useState<SignState>(initialSignState);

  // Solana hooks
  const { solanaSigner } = useParaSolanaSigner({ rpc });
  const { signMessage: solanaExternalSign } = useSolanaWallet();
  const [solanaState, setSolanaState] = useState<SignState>(initialSignState);

  const isExternal = connectionType === "external";

  // Detect available chains from embedded wallets and external connections
  const wallets = (embedded.wallets ?? []) as WalletWithType[];
  const connectedNetworks = external.connectedNetworks ?? [];

  const hasEvm = wallets.some((wallet) => wallet.type === "EVM") || connectedNetworks.includes("evm");
  const hasCosmos = wallets.some((wallet) => wallet.type === "COSMOS") || connectedNetworks.includes("cosmos");
  const hasSolana = wallets.some((wallet) => wallet.type === "SOLANA") || connectedNetworks.includes("solana");

  const signEvm = useCallback(async () => {
    setEvmState({ isPending: true, errorMessage: null, signature: undefined });
    try {
      const sig = await wagmiSign({ message: HELLO_WORLD_MESSAGE });
      setEvmState({ isPending: false, errorMessage: null, signature: sig });
    } catch (err) {
      setEvmState({ isPending: false, errorMessage: getErrorMessage(err, "EVM signing failed"), signature: undefined });
    }
  }, [wagmiSign]);

  const signCosmos = useCallback(async () => {
    const externalCosmosSigner = grazSigners?.offlineSignerAmino as OfflineAminoSigner | undefined;
    const signer: OfflineAminoSigner | null | undefined = isExternal ? externalCosmosSigner : cosmosEmbedded;
    if (!signer) {
      setCosmosState({ isPending: false, errorMessage: "No Cosmos signer available", signature: undefined });
      return;
    }
    setCosmosState({ isPending: true, errorMessage: null, signature: undefined });
    try {
      const accounts = await signer.getAccounts();
      if (!accounts.length) throw new Error("No Cosmos accounts found");
      const address = accounts[0].address;
      const signDoc = makeSignDoc(
        [{ type: "sign/MsgSignData", value: { signer: address, data: btoa(HELLO_WORLD_MESSAGE) } }],
        { amount: [], gas: "0" },
        CHAIN_ID,
        "",
        0,
        0
      );
      const { signature: sig } = await signer.signAmino(address, signDoc);
      setCosmosState({ isPending: false, errorMessage: null, signature: sig.signature });
    } catch (err) {
      setCosmosState({ isPending: false, errorMessage: getErrorMessage(err, "Cosmos signing failed"), signature: undefined });
    }
  }, [isExternal, grazSigners, cosmosEmbedded]);

  const signSolana = useCallback(async () => {
    setSolanaState({ isPending: true, errorMessage: null, signature: undefined });
    try {
      const encoded = new TextEncoder().encode(HELLO_WORLD_MESSAGE);
      if (isExternal && solanaExternalSign) {
        const sig = await solanaExternalSign(encoded);
        setSolanaState({ isPending: false, errorMessage: null, signature: bytesToBase64(sig) });
      } else if (solanaSigner) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await (solanaSigner as any).signMessages([{ content: encoded, signatures: {} }]);
        const sigBytes = Object.values(results[0] as Record<string, Uint8Array>)[0];
        if (!sigBytes) throw new Error("Unexpected signing result format");
        setSolanaState({ isPending: false, errorMessage: null, signature: bytesToBase64(sigBytes) });
      } else {
        throw new Error("No Solana signer available");
      }
    } catch (err) {
      setSolanaState({ isPending: false, errorMessage: getErrorMessage(err, "Solana signing failed"), signature: undefined });
    }
  }, [isExternal, solanaExternalSign, solanaSigner]);

  const chains: ChainSignState[] = [];
  if (hasEvm) chains.push({ chainId: "evm", label: "EVM", sign: signEvm, ...evmState });
  if (hasCosmos) chains.push({ chainId: "cosmos", label: "Cosmos", sign: signCosmos, ...cosmosState });
  if (hasSolana) chains.push({ chainId: "solana", label: "Solana", sign: signSolana, ...solanaState });

  return { message: HELLO_WORLD_MESSAGE, chains };
}
