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
  error: Error | null;
  signature?: string;
};

export function useMultichainSign() {
  const { connectionType, embedded, external } = useAccount();

  // EVM hooks
  const { signMessageAsync: wagmiSign } = useWagmiSignMessage();
  const [evmState, setEvmState] = useState({ isPending: false, error: null as Error | null, signature: undefined as string | undefined });

  // Cosmos hooks
  const { aminoSigner: cosmosEmbedded } = useParaCosmjsAminoSigner();
  const { data: grazSigners } = useOfflineSigners();
  const [cosmosState, setCosmosState] = useState({ isPending: false, error: null as Error | null, signature: undefined as string | undefined });

  // Solana hooks
  const { solanaSigner } = useParaSolanaSigner({ rpc });
  const { signMessage: solanaExternalSign } = useSolanaWallet();
  const [solanaState, setSolanaState] = useState({ isPending: false, error: null as Error | null, signature: undefined as string | undefined });

  const isExternal = connectionType === "external";

  // Detect available chains from embedded wallets and external connections
  const wallets = embedded.wallets ?? [];
  const connectedNetworks = external.connectedNetworks ?? [];

  const hasEvm = wallets.some((w: any) => w.type === "EVM") || connectedNetworks.includes("evm");
  const hasCosmos = wallets.some((w: any) => w.type === "COSMOS") || connectedNetworks.includes("cosmos");
  const hasSolana = wallets.some((w: any) => w.type === "SOLANA") || connectedNetworks.includes("solana");

  const signEvm = useCallback(async () => {
    setEvmState((s) => ({ ...s, isPending: true, error: null }));
    try {
      const sig = await wagmiSign({ message: HELLO_WORLD_MESSAGE });
      setEvmState((s) => ({ ...s, signature: sig }));
    } catch (err) {
      setEvmState((s) => ({ ...s, error: err instanceof Error ? err : new Error("EVM signing failed") }));
    } finally {
      setEvmState((s) => ({ ...s, isPending: false }));
    }
  }, [wagmiSign]);

  const signCosmos = useCallback(async () => {
    const externalCosmosSigner = grazSigners?.offlineSignerAmino as OfflineAminoSigner | undefined;
    const signer: OfflineAminoSigner | null | undefined = isExternal ? externalCosmosSigner : cosmosEmbedded;
    if (!signer) return;
    setCosmosState((s) => ({ ...s, isPending: true, error: null }));
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
      setCosmosState((s) => ({ ...s, signature: sig.signature }));
    } catch (err) {
      setCosmosState((s) => ({ ...s, error: err instanceof Error ? err : new Error("Cosmos signing failed") }));
    } finally {
      setCosmosState((s) => ({ ...s, isPending: false }));
    }
  }, [isExternal, grazSigners, cosmosEmbedded]);

  const signSolana = useCallback(async () => {
    setSolanaState((s) => ({ ...s, isPending: true, error: null }));
    try {
      const encoded = new TextEncoder().encode(HELLO_WORLD_MESSAGE);
      if (isExternal && solanaExternalSign) {
        const sig = await solanaExternalSign(encoded);
        setSolanaState((s) => ({ ...s, signature: Buffer.from(sig).toString("base64") }));
      } else if (solanaSigner) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = await (solanaSigner as any).signMessages([{ content: encoded, signatures: {} }]);
        const sigBytes = Object.values(results[0] as Record<string, Uint8Array>)[0];
        if (!sigBytes) throw new Error("Unexpected signing result format");
        setSolanaState((s) => ({ ...s, signature: Buffer.from(sigBytes).toString("base64") }));
      } else {
        throw new Error("No Solana signer available");
      }
    } catch (err) {
      setSolanaState((s) => ({ ...s, error: err instanceof Error ? err : new Error("Solana signing failed") }));
    } finally {
      setSolanaState((s) => ({ ...s, isPending: false }));
    }
  }, [isExternal, solanaExternalSign, solanaSigner]);

  const chains: ChainSignState[] = [];
  if (hasEvm) chains.push({ chainId: "evm", label: "EVM", sign: signEvm, ...evmState });
  if (hasCosmos) chains.push({ chainId: "cosmos", label: "Cosmos", sign: signCosmos, ...cosmosState });
  if (hasSolana) chains.push({ chainId: "solana", label: "Solana", sign: signSolana, ...solanaState });

  return { message: HELLO_WORLD_MESSAGE, chains };
}
