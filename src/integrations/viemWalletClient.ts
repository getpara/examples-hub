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

import { Capsule } from '../Capsule';
import { SuccessfulSignatureRes } from '../types';
import { hexStringToBase64, hexToSignature } from '../utils/formattingUtils';

function createCapsuleAccount(capsule: Capsule): LocalAccount {
  const currentWallet = Object.values(capsule.getWallets())[0];
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
      return serializer(
        transaction,
        hexToSignature(`0x${signature}`),
      );
    },
    signTypedData: async <
      TTypedData extends TypedData | { [key: string]: unknown },
      TPrimaryType extends string = string,
    >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) => {
      const signature = await capsule.signMessage(currentWallet.id, hexStringToBase64(hashTypedData(typedData)));
      return `0x${signature}`;
    },
  };
}

export function createCapsuleViemClient(capsule: Capsule, params: WalletClientConfig): WalletClient {
  return createWalletClient({
    account: createCapsuleAccount(capsule),
    ...params,
  });
}
