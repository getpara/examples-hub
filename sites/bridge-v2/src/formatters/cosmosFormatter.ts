import { coins, encodePubkey, makeAuthInfoBytes, makeSignDoc, makeSignBytes } from '@cosmjs/proto-signing';
import { serializeSignDoc, StdSignDoc } from '@cosmjs/amino';
import { logger, formatError } from '../logging';

export interface CosmosTransactionParams {
  to: string;
  amount: string;
  denom?: string;
  memo?: string;
  gasLimit?: string;
  gasPrice?: string; // micro-denom per gas unit (e.g., uatom)
  sequence?: number;
  accountNumber?: number;
  chainId?: string;
  format?: 'proto' | 'amino'; // Specify transaction format
}

/**
 * Formats a Cosmos transaction from JSON parameters
 * Returns raw signBytes (Proto) or serialized SignDoc (Amino)
 * Pure function - no hashing, just formatting
 */
export async function formatCosmosTransaction(
  params: CosmosTransactionParams,
  fromAddress: string,
  publicKey: Uint8Array,
  chainId: string,
): Promise<{ signBytes: Uint8Array; signDoc: any; format: 'proto' | 'amino' }> {
  try {
    logger.info('Formatting Cosmos transaction', { params, fromAddress, chainId, format: params.format || 'proto' });

    // Create the send message
    const sendMsg = {
      typeUrl: '/cosmos.bank.v1beta1.MsgSend',
      value: {
        fromAddress,
        toAddress: params.to,
        amount: coins(params.amount, params.denom || 'uatom'),
      },
    } as const;

    // Set defaults
    const sequence = params.sequence ?? 0;
    const accountNumber = params.accountNumber ?? 0;
    const gasLimit = params.gasLimit ?? '200000';

    // Create auth info
    const pubkey = encodePubkey({
      type: 'tendermint/PubKeySecp256k1',
      value: Buffer.from(publicKey).toString('base64'),
    });

    // Fix: feeAmount = gasPrice * gasLimit (both in micro-denom units)
    const gasPrice = params.gasPrice ?? '0';
    const feeAmount = (BigInt(gasPrice) * BigInt(gasLimit)).toString();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence }],
      coins(feeAmount, params.denom || 'uatom'), // Fee amount in coins
      Number(gasLimit), // Gas limit as number
      undefined,
      undefined,
    );

    // Create sign doc
    const signDoc = makeSignDoc([sendMsg] as any, authInfoBytes, chainId, accountNumber);

    // Handle different formats
    if (params.format === 'amino') {
      // Create Amino sign doc
      const gasPrice = params.gasPrice ?? '0';
      const feeAmount = (BigInt(gasPrice) * BigInt(gasLimit)).toString();
      const aminoSignDoc: StdSignDoc = {
        chain_id: chainId,
        account_number: accountNumber.toString(),
        sequence: sequence.toString(),
        fee: {
          amount: coins(feeAmount, params.denom || 'uatom'), // Use gasPrice for fee
          gas: gasLimit,
        },
        msgs: [
          {
            type: 'cosmos-sdk/MsgSend',
            value: {
              from_address: fromAddress,
              to_address: params.to,
              amount: coins(params.amount, params.denom || 'uatom'),
            },
          },
        ],
        memo: params.memo || '',
      };

      // Return serialized Amino sign doc (NOT hashed)
      const serialized = serializeSignDoc(aminoSignDoc);

      logger.info('Cosmos Amino transaction formatted successfully');
      return {
        signBytes: new Uint8Array(serialized),
        signDoc: aminoSignDoc,
        format: 'amino',
      };
    } else {
      // Proto format (default)
      // Return sign bytes (NOT hashed)
      const signBytes = makeSignBytes(signDoc);

      logger.info('Cosmos Proto transaction formatted successfully');
      return {
        signBytes: new Uint8Array(signBytes),
        signDoc,
        format: 'proto',
      };
    }
  } catch (error) {
    logger.error('Failed to format Cosmos transaction:', formatError(error));
    throw error;
  }
}

/**
 * Formats a Cosmos message for signing
 * Cosmos uses ADR-036 for arbitrary message signing
 */
export function formatCosmosMessage(message: string, signer: string): string {
  try {
    logger.info('Formatting Cosmos message', { message, signer });

    // Create ADR-036 sign doc
    const signDoc = {
      chain_id: '',
      account_number: '0',
      sequence: '0',
      fee: {
        gas: '0',
        amount: [],
      },
      msgs: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer,
            data: Buffer.from(message, 'utf8').toString('base64'),
          },
        },
      ],
      memo: '',
    };

    // Convert to canonical JSON and then base64
    const canonicalJson = JSON.stringify(signDoc, Object.keys(signDoc).sort());
    const messageBase64 = Buffer.from(canonicalJson, 'utf8').toString('base64');

    logger.info('Cosmos message formatted successfully', { messageBase64 });
    return messageBase64;
  } catch (error) {
    logger.error('Failed to format Cosmos message:', formatError(error));
    throw error;
  }
}
