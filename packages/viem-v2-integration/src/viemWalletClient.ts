import {
  createWalletClient,
  WalletClient,
  WalletClientConfig,
  Address,
  hashMessage,
  serializeTransaction,
  TransactionSerializable,
  TypedData,
  TypedDataDefinition,
  Hex,
  SerializeTransactionFn,
  hashTypedData,
  Account,
  Transport,
  Chain,
  LocalAccount,
} from 'viem';
import * as viemChains from 'viem/chains';

import ParaCore, { hexStringToBase64, hexToSignature, Wallet, SuccessfulSignatureRes } from '@getpara/core-sdk';

interface ViemClientOpts {
  noAccount?: boolean;
}

export function createParaAccount(para: ParaCore, walletAddress?: Hex): LocalAccount {
  let currentWallet: Wallet;
  if (walletAddress) {
    currentWallet = para.findWalletByAddress(walletAddress, { type: ['EVM'] });
  } else {
    const walletId = para.findWalletId(undefined, { type: ['EVM'] });
    currentWallet = para.wallets[walletId];
  }

  return {
    address: currentWallet.address as Address,
    publicKey: (currentWallet.publicKey as Hex) || '0x',
    source: 'custom',
    type: 'local',
    signMessage: async ({ message }) => {
      const hashedMessage = hashMessage(message);
      const res = await para.signMessage({ walletId: currentWallet.id, messageBase64: hexStringToBase64(hashedMessage) });
      const signature = (res as SuccessfulSignatureRes).signature;
      return `0x${signature}`;
    },
    signTransaction: async <TTransactionSerializable extends TransactionSerializable>(
      transaction: TTransactionSerializable,
      args?: {
        serializer?: SerializeTransactionFn;
      },
    ) => {
      let { serializer } = args || {};
      if (!serializer) {
        serializer = serializeTransaction;
      }

      const serializedTx = serializer(transaction, {
        r: '0x',
        s: '0x',
        v: BigInt(0),
      });
      const res = await para.signTransaction({
        walletId: currentWallet.id,
        rlpEncodedTxBase64: hexStringToBase64(serializedTx.substring(2)),
        chainId: `${transaction.chainId}`,
      });
      const signature = (res as SuccessfulSignatureRes).signature;
      const formattedSig = hexToSignature(`0x${signature}`);
      formattedSig.v += BigInt(27);

      return serializer(transaction, formattedSig);
    },
    signTypedData: async <
      const typedData extends TypedData | Record<string, unknown>,
      primaryType extends keyof typedData | 'EIP712Domain' = keyof typedData,
    >(
      typedDataDefinition: TypedDataDefinition<typedData, primaryType>,
    ) => {
      const res = await para.signMessage({
        walletId: currentWallet.id,
        messageBase64: hexStringToBase64(hashTypedData(typedDataDefinition)),
      });
      const signature = (res as SuccessfulSignatureRes).signature;
      return `0x${signature}`;
    },
  };
}

export function getViemChain(chainId: string): viemChains.Chain {
  const chainIdNum = Number(chainId);
  for (const chain of Object.values(viemChains)) {
    if (chain.id === chainIdNum) {
      return chain as viemChains.Chain;
    }
  }

  throw new Error(`chain with id ${chainId} not found`);
}

export function createParaViemClient(
  para: ParaCore,
  params: WalletClientConfig,
  opts?: ViemClientOpts,
): WalletClient<Transport, Chain, Account> {
  return createWalletClient({
    account: opts?.noAccount ? undefined : createParaAccount(para),
    ...params,
  });
}
