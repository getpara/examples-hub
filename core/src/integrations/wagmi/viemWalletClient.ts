import {
  createWalletClient,
  WalletClient,
  WalletClientConfig,
  LocalAccount,
  Address,
  hashMessage,
  serializeTransaction,
  TransactionSerializable,
  TypedData,
  TypedDataDefinition,
  hashTypedData,
  Hex,
  SerializeTransactionFn,
} from 'viem';
import * as viemChains from 'viem/chains';

import { CoreCapsule, Wallet } from '../../CoreCapsule';
import type { SuccessfulSignatureRes } from '../../types';
import { hexStringToBase64, hexToSignature } from '../../utils/formattingUtils';

interface ViemClientOpts {
  noAccount?: boolean;
}

export function createCapsuleAccount(capsule: CoreCapsule, walletAddress?: Hex): LocalAccount {
  let currentWallet: Wallet;
  if (walletAddress) {
    currentWallet = Object.values(capsule.getWallets()).find(wallet => wallet.address.toLowerCase() === walletAddress.toLowerCase());
  } else {
    currentWallet = Object.values(capsule.getWallets())[0];
  }

  return {
    address: currentWallet.address as Address,
    publicKey: currentWallet.publicKey as Hex || '0x',
    source: 'custom',
    type: 'local',
    signMessage: async ({ message }) => {
      const hashedMessage = hashMessage(message);
      const res = await capsule.signMessage(currentWallet.id, hexStringToBase64(hashedMessage));
      const signature = (res as SuccessfulSignatureRes).signature;
      return `0x${signature}`;
    },
    signTransaction: async <TTransactionSerializable extends TransactionSerializable>(
      transaction: TTransactionSerializable,
      args?: {
        serializer?: SerializeTransactionFn<TTransactionSerializable>
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
      const res = await capsule.signTransaction(currentWallet.id, hexStringToBase64(serializedTx.substring(2)), `${transaction.chainId}`);
      const signature = (res as SuccessfulSignatureRes).signature;
      const formattedSig = hexToSignature(`0x${signature}`);
      formattedSig.v += BigInt(27);

      return serializer(transaction, formattedSig);
    },
    signTypedData: async <
      TTypedData extends TypedData | { [key: string]: unknown },
      TPrimaryType extends string = string,
    >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) => {
      const res = await capsule.signMessage(currentWallet.id, hexStringToBase64(hashTypedData(typedData)));
      const signature = (res as SuccessfulSignatureRes).signature;
      return `0x${signature}`;
    },
  };
}

export function getViemChain(chainId: string): viemChains.Chain {
  const chainIdNum = Number(chainId);
  for (const chain of Object.values(viemChains)) {
    if (chain.id === chainIdNum) {
      return chain;
    }
  }

  throw new Error(`chain with id ${chainId} not found`);
}

export function createCapsuleViemClient(capsule: CoreCapsule, params: WalletClientConfig, opts?: ViemClientOpts): WalletClient {
  return createWalletClient({
    account: opts?.noAccount ? undefined : createCapsuleAccount(capsule),
    ...params,
  });
}
