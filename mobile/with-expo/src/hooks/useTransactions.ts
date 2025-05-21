import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSigners } from "./useSigners";
import { useWallets } from "./useWallets";
import { usePrices } from "./usePrices";
import { WalletType } from "@getpara/react-native-wallet";
import { ethers, parseEther, formatEther } from "ethers";
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction as SolTx } from "@solana/web3.js";
import { v4 as uuid } from "uuid";
import { TransactionData, EvmTransactionData } from "@/components/transaction/TransactionListItem";
import { ALCHEMY_ETHEREUM_RPC_URL, ALCHEMY_SOLANA_RPC_URL } from "@/constants/envs";

type EvmArgs = { to: string; amount: string };
type SolArgs = { to: string; amount: string };

const fetchEvmTransfers = async (addr: string, price: number | null): Promise<TransactionData[]> => {
  if (!ALCHEMY_ETHEREUM_RPC_URL) return [];
  const transfers: TransactionData[] = [];
  let pageKey: string | undefined;
  do {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "alchemy_getAssetTransfers",
      params: [
        {
          fromBlock: "0x0",
          toBlock: "latest",
          withMetadata: true,
          excludeZeroValue: false,
          category: ["external", "internal", "erc20"],
          fromAddress: addr,
          toAddress: undefined,
          order: "desc",
          maxCount: "0x3e8",
          pageKey,
        },
      ],
    };
    const res = await fetch(ALCHEMY_ETHEREUM_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());
    const items = res.result.transfers as any[];
    items.forEach((t) => {
      const isSender = t.from.toLowerCase() === addr.toLowerCase();
      const amt = t.value ? ethers.formatUnits(BigInt(t.value), 18) : "0";
      transfers.push({
        id: uuid(),
        type: isSender ? "send" : "receive",
        status: "confirmed",
        timestamp: t.metadata?.blockTimestamp ? Date.parse(t.metadata.blockTimestamp) : Date.now(),
        amount: amt,
        tokenTicker: t.asset ?? "ETH",
        tokenName: t.asset ?? "Ether",
        amountUsd: price ? parseFloat(amt) * price : null,
        networkType: WalletType.EVM,
        counterpartyAddress: isSender ? t.to : t.from,
        hash: t.hash,
        blockNumber: parseInt(t.blockNum, 16),
      } as EvmTransactionData);
    });
    pageKey = res.result.pageKey;
  } while (pageKey);
  return transfers;
};

const fetchSolTransfers = async (conn: Connection, addr: string, price: number | null): Promise<TransactionData[]> => {
  const sigs = await conn.getSignaturesForAddress(new PublicKey(addr), {
    limit: 20,
  });
  return sigs.map((s) => ({
    id: uuid(),
    type: "send",
    status: s.confirmationStatus === "finalized" ? "confirmed" : "pending",
    timestamp: (s.blockTime ?? Date.now() / 1000) * 1000,
    amount: "0",
    tokenTicker: "SOL",
    tokenName: "Solana",
    amountUsd: null,
    networkType: WalletType.SOLANA,
    counterpartyAddress: "",
    hash: s.signature,
    slot: s.slot,
  })) as TransactionData[];
};

export const useTransactions = () => {
  const qc = useQueryClient();
  const { ethereumSigner, solanaSigner, solanaConnection } = useSigners();
  const { wallets } = useWallets();
  const { ethPrice, solPrice } = usePrices();

  const historyQuery = useQuery<TransactionData[], Error>({
    queryKey: ["transactionHistory"],
    queryFn: async () => {
      const evmAddrs = wallets[WalletType.EVM].map((w) => w.address).filter(Boolean) as string[];
      const solAddrs = wallets[WalletType.SOLANA].map((w) => w.address).filter(Boolean) as string[];

      const evm = (await Promise.all(evmAddrs.map((a) => fetchEvmTransfers(a, ethPrice)))).flat();
      const sol = (
        await Promise.all(
          solAddrs.map((a) => (solanaConnection ? fetchSolTransfers(solanaConnection, a, solPrice) : []))
        )
      ).flat();
      return [...evm, ...sol].sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!ALCHEMY_ETHEREUM_RPC_URL || !!ALCHEMY_SOLANA_RPC_URL,
  });

  const estimateEvmFee = useMutation<{ feeEth: string; feeUsd: number | null }, Error, EvmArgs>({
    mutationFn: async ({ to, amount }) => {
      if (!ethereumSigner) throw new Error("no evm signer");
      const value = parseEther(amount);
      const limit = await ethereumSigner.estimateGas({ to, value });
      const fd = await ethereumSigner.provider!.getFeeData();
      const max = limit * (fd.maxFeePerGas ?? BigInt(0));
      const feeEth = formatEther(max);
      return { feeEth, feeUsd: ethPrice ? parseFloat(feeEth) * ethPrice : null };
    },
  });

  const estimateSolFee = useMutation<{ feeSol: string; feeUsd: number | null }, Error, SolArgs>({
    mutationFn: async () => {
      const lamports = 5000;
      const solFee = lamports / LAMPORTS_PER_SOL;
      return { feeSol: solFee.toFixed(9), feeUsd: solPrice ? solFee * solPrice : null };
    },
  });

  const sendEvm = useMutation<string, Error, EvmArgs>({
    mutationFn: async ({ to, amount }) => {
      if (!ethereumSigner) throw new Error("no evm signer");
      const val = parseEther(amount);
      const limit = await ethereumSigner.estimateGas({ to, value: val });
      const fd = await ethereumSigner.provider!.getFeeData();
      const tx = await ethereumSigner.sendTransaction({
        to,
        value: val,
        gasLimit: limit,
        maxFeePerGas: fd.maxFeePerGas,
        maxPriorityFeePerGas: fd.maxPriorityFeePerGas,
      });
      const rec = await tx.wait();
      return rec?.hash ?? tx.hash;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactionHistory"] }),
  });

  const sendSol = useMutation<string, Error, SolArgs>({
    mutationFn: async ({ to, amount }) => {
      if (!solanaSigner || !solanaConnection) throw new Error("no sol signer");
      const from = new PublicKey((solanaSigner as any).publicKey);
      const tx = new SolTx().add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: new PublicKey(to),
          lamports: Math.round(parseFloat(amount) * LAMPORTS_PER_SOL),
        })
      );
      const latest = await solanaConnection.getLatestBlockhash();
      tx.recentBlockhash = latest.blockhash;
      tx.feePayer = from;
      const sig = await solanaSigner.sendTransaction(tx);
      await solanaConnection.confirmTransaction(
        { signature: sig, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight },
        "confirmed"
      );
      return sig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactionHistory"] }),
  });

  return {
    history: historyQuery.data ?? [],
    isHistoryLoading: historyQuery.isLoading,
    historyError: historyQuery.error,
    refreshHistory: historyQuery.refetch,
    estimateEvmFee: estimateEvmFee.mutateAsync,
    isEstimatingEvmFee: estimateEvmFee.isPending,
    estimateEvmFeeError: estimateEvmFee.error,
    estimateSolFee: estimateSolFee.mutateAsync,
    isEstimatingSolFee: estimateSolFee.isPending,
    estimateSolFeeError: estimateSolFee.error,
    sendEvmTransaction: sendEvm.mutateAsync,
    isSendingEvm: sendEvm.isPending,
    sendEvmError: sendEvm.error,
    sendSolTransaction: sendSol.mutateAsync,
    isSendingSol: sendSol.isPending,
    sendSolError: sendSol.error,
  };
};
