// import {
//   createWalletClient,
//   WalletClient,
//   WalletClientConfig,
//   LocalAccount,
//   Address,
//   hashMessage,
//   serializeTransaction,
//   TransactionSerializable,
//   TypedData,
//   TypedDataDefinition,
//   hashTypedData,
//   Hex,
// } from 'viem';
// import { Capsule } from '../Capsule';
// import { SuccessfulSignatureRes } from '../types';
// import { hexStringToBase64, hexToSignature } from '../utils/formattingUtils';

// function createCapsuleAccount(capsule: Capsule): LocalAccount {
//   const currentWallet = Object.values(capsule.getWallets())[0];
//   return {
//     address: currentWallet.address as Address,
//     publicKey: currentWallet.publicKey as Hex || '0x',
//     source: 'custom',
//     type: 'local',
//     signMessage: async ({ message }) => {
//       const hashedMessage = hashMessage(message);
//       const res = await capsule.signMessage(currentWallet.id, hashedMessage);
//       const signature = (res as SuccessfulSignatureRes).signature;
//      return `0x${signature}`;
//     },
//     signTransaction: async <TTransactionSerializable extends TransactionSerializable>(transaction: TTransactionSerializable, { serializer } = { serializer: serializeTransaction }) => {
//       const serializedTx = serializer(transaction);
//       const res = await capsule.signTransaction(currentWallet.id, hexStringToBase64(serializedTx), `${transaction.chainId}`);
//       const signature = (res as SuccessfulSignatureRes).signature;
//       return serializer(
//         transaction,
//         hexToSignature(`0x${signature}`),
//       );
//     },
//     signTypedData: async <
//       TTypedData extends TypedData | { [key: string]: unknown },
//       TPrimaryType extends string = string,
//     >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>) => {
//       const signature = await capsule.signMessage(currentWallet.id, hexStringToBase64(hashTypedData(typedData)));
//       return `0x${signature}`;
//     },
//   };
// }

// export function createCapsuleClient(capsule: Capsule, params: WalletClientConfig): WalletClient {
//   return createWalletClient({
//     account: createCapsuleAccount(capsule),
//     ...params,
//   });
// }
export {}
