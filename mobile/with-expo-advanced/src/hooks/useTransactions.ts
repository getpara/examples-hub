import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSigners } from './useSigners';
import { useWallets } from './useWallets';
import { usePrices } from './usePrices';
import { WalletType } from '@getpara/react-native-wallet';
import { parseEther, formatEther } from 'ethers';
import {
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction as SolTx,
} from '@solana/web3.js';
import {
  TransactionData,
  EvmTransactionData,
  SolanaTransactionData,
} from '@/components/transaction/TransactionListItem';
import {
  ALCHEMY_ETHEREUM_RPC_URL,
  ALCHEMY_SOLANA_RPC_URL,
} from '@/constants/envs';
import {
  fetchEvmTransfers,
  fetchSolanaTransfers,
  Transfer,
} from '@/utils/api/transfersApi';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { createTransactionQueryOptions } from '@/utils/queryUtils';

type EvmArgs = { to: string; amount: string };
type SolArgs = { to: string; amount: string };

// Transform Transfer to TransactionData format
function transferToTransactionData(
  transfer: Transfer,
  price: number | null
): TransactionData {
  const amount = parseFloat(transfer.value);
  const baseData = {
    id: transfer.hash, // Use hash as ID for uniqueness
    type: 'send' as const,
    status: transfer.status,
    timestamp: transfer.timestamp,
    amount: transfer.value,
    tokenTicker: transfer.symbol,
    tokenName: transfer.symbol, // We don't have full name in Transfer
    amountUsd: price ? amount * price : null,
    counterpartyAddress: transfer.to,
    hash: transfer.hash,
  };

  if (transfer.network === WalletType.SOLANA) {
    return {
      ...baseData,
      networkType: WalletType.SOLANA,
      fee: transfer.fee,
    } as SolanaTransactionData;
  } else {
    return {
      ...baseData,
      networkType: WalletType.EVM,
      blockNumber: transfer.blockNumber,
    } as EvmTransactionData;
  }
}

export const useTransactions = () => {
  const qc = useQueryClient();
  const {
    ethereumProvider,
    ethereumSigner,
    solanaSigner,
    solanaConnection,
    areSignersInitialized,
  } = useSigners();
  const { wallets } = useWallets();
  const { ethPrice, solPrice } = usePrices();

  const allWallets = [
    ...wallets[WalletType.EVM],
    ...wallets[WalletType.SOLANA],
  ];
  const walletIds = allWallets.map((w) => w.id);

  const historyQuery = useQuery<TransactionData[], Error>(
    createTransactionQueryOptions({
      queryKey: QUERY_KEYS.TRANSACTIONS_BY_WALLETS(walletIds),
      queryFn: async () => {
        if (allWallets.length === 0) {
          return [];
        }

        // Fetch transfers for each wallet type
        const transferPromises: Promise<Transfer[]>[] = [];

        // Fetch EVM transfers
        if (wallets[WalletType.EVM].length > 0 && ethereumProvider) {
          for (const wallet of wallets[WalletType.EVM]) {
            transferPromises.push(fetchEvmTransfers(wallet, ethereumProvider));
          }
        }

        // Fetch Solana transfers
        if (wallets[WalletType.SOLANA].length > 0 && solanaConnection) {
          for (const wallet of wallets[WalletType.SOLANA]) {
            transferPromises.push(
              fetchSolanaTransfers(wallet, solanaConnection)
            );
          }
        }

        // Use Promise.allSettled so one failure doesn't cancel all
        const results = await Promise.allSettled(transferPromises);

        // Collect all successful transfers
        const allTransfers: Transfer[] = [];
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            allTransfers.push(...result.value);
          } else {
            console.error('Failed to fetch transfers:', result.reason);
          }
        });

        // Get current prices for conversion
        const priceMap: Record<string, number | null> = {
          ETH: ethPrice,
          SOL: solPrice,
          // Add more token prices as needed
        };

        // Transform transfers to transaction data
        return allTransfers.map((transfer) => {
          const price = priceMap[transfer.symbol] || null;
          return transferToTransactionData(transfer, price);
        });
      },
      enabled:
        areSignersInitialized &&
        allWallets.length > 0 &&
        (!!ALCHEMY_ETHEREUM_RPC_URL || !!ALCHEMY_SOLANA_RPC_URL),
    })
  );

  const estimateEvmFee = useMutation<
    { feeEth: string; feeUsd: number | null },
    Error,
    EvmArgs
  >({
    mutationFn: async ({ to, amount }) => {
      if (!ethereumSigner || !ethereumSigner.provider) {
        throw new Error('no evm signer or provider');
      }
      const value = parseEther(amount);
      const limit = await ethereumSigner.estimateGas({ to, value });
      const fd = await ethereumSigner.provider.getFeeData();
      // Use gasPrice as fallback for maxFeePerGas
      const feePerGas = fd.maxFeePerGas ?? fd.gasPrice ?? BigInt(0);
      const max = limit * feePerGas;
      const feeEth = formatEther(max);
      return {
        feeEth,
        feeUsd: ethPrice ? parseFloat(feeEth) * ethPrice : null,
      };
    },
  });

  const estimateSolFee = useMutation<
    { feeSol: string; feeUsd: number | null },
    Error,
    SolArgs
  >({
    mutationFn: async () => {
      const lamports = 5000;
      const solFee = lamports / LAMPORTS_PER_SOL;
      return {
        feeSol: solFee.toFixed(9),
        feeUsd: solPrice ? solFee * solPrice : null,
      };
    },
  });

  const sendEvm = useMutation<string, Error, EvmArgs>({
    mutationFn: async ({ to, amount }) => {
      if (!ethereumSigner || !ethereumSigner.provider) {
        throw new Error('no evm signer or provider');
      }
      const val = parseEther(amount);
      const limit = await ethereumSigner.estimateGas({ to, value: val });
      const fd = await ethereumSigner.provider.getFeeData();
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
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS }),
  });

  const sendSol = useMutation<string, Error, SolArgs>({
    mutationFn: async ({ to, amount }) => {
      if (!solanaSigner || !solanaConnection) throw new Error('no sol signer');
      if (!solanaSigner.sender) {
        throw new Error('Solana signer not initialized');
      }
      const from = solanaSigner.sender;
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
        {
          signature: sig,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        'confirmed'
      );
      return sig;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: QUERY_KEYS.TRANSACTIONS }),
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
