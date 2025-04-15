import { coin, StargateClient } from '@cosmjs/stargate';
import ParaCore from '@getpara/core-sdk';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import { AuthInfo, SignDoc, Tx, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

/**
 * Creates a Cosmos transaction to sign and validate that your Para application is properly working.
 * The transaction, if broadcast, simply sends 0.01 ATOM from the wallet back to itself.
 * @param {ParaCore} para your Para instance
 * @param {string} walletId the EVM wallet ID to use.
 * @returns {Promise<SignDoc>} the generated Cosmos `SignDoc`.
 */
export async function createTestTransaction(para: ParaCore, walletId?: string): Promise<SignDoc> {
  walletId = para.findWalletId(walletId, { type: ['COSMOS'] });

  const wallet = para.wallets[walletId];
  const address = para.getDisplayAddress(wallet.id, { addressType: 'COSMOS' });

  const client = await StargateClient.connect('https://cosmos-rpc.publicnode.com:443');
  const account = await client.getAccount(address);

  if (!account) {
    throw new Error(
      `You must fund this account with testnet ATOM tokens before you can sign transactions. Your address is ${address}. The testnet faucet can be found at: https://discord.com/channels/669268347736686612/953697793476821092`,
    );
  }

  const transaction = Tx.fromPartial({
    body: {
      messages: [
        {
          typeUrl: '/cosmos.bank.v1beta1.MsgSend',
          value: MsgSend.encode(
            MsgSend.fromPartial({
              fromAddress: address,
              toAddress: address,
              amount: [{ denom: 'uatom', amount: '0.01' }],
            }),
          ).finish(),
        },
      ],
      memo: '',
    },
    authInfo: {
      fee: {
        amount: [coin(5000, 'uatom')],
        gasLimit: BigInt(80000),
      },
    },
    signatures: [],
  });

  const signDoc: SignDoc = {
    accountNumber: BigInt(account!.accountNumber),
    bodyBytes: TxBody.encode(transaction.body!).finish(),
    authInfoBytes: AuthInfo.encode(transaction.authInfo!).finish(),
    chainId: 'theta-testnet-001',
  };

  return signDoc;
}
