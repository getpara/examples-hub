import { ethers } from 'ethers';
import { logger, formatError } from '../logging';

export interface EVMTransactionParams {
  to?: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string | number;
  type?: number;
  chainId?: string;
}

/**
 * Formats an EVM transaction from JSON parameters to RLP-encoded base64
 * Following the exact pattern from @getpara/ethers-v6-integration
 */
export async function formatEVMTransaction(
  params: EVMTransactionParams,
  fromAddress: string,
  chainId?: string,
): Promise<string> {
  try {
    logger.info('Formatting EVM transaction', { params, fromAddress, chainId });

    // Build transaction request (matching ethers-v6-integration pattern)
    const txRequest: ethers.TransactionRequest = {
      to: params.to,
      value: params.value,
      data: params.data,
      gasLimit: params.gasLimit,
      gasPrice: params.gasPrice,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
      // Accept nonce as hex string or number; if string and not hex, parse decimal
      nonce:
        params.nonce == null
          ? undefined
          : typeof params.nonce === 'string'
            ? params.nonce.startsWith('0x') || params.nonce.startsWith('0X')
              ? Number(BigInt(params.nonce))
              : Number(params.nonce)
            : params.nonce,
      type: params.type,
      // Integration uses numeric chainId when present
      chainId:
        chainId !== undefined && chainId !== null && chainId !== ''
          ? BigInt(chainId)
          : params.chainId != null && String(params.chainId) !== ''
            ? BigInt(String(params.chainId))
            : undefined,
    };

    // Remove undefined fields
    for (const key of Object.keys(txRequest) as Array<keyof typeof txRequest>) {
      if (txRequest[key] === undefined) {
        delete (txRequest as any)[key];
      }
    }

    // Create transaction object (following validateTx pattern from ethers integration)
    // Note: 'from' is explicitly NOT included in the Transaction object
    const tx = ethers.Transaction.from(txRequest as ethers.TransactionLike<string>);

    // Add dummy signature for serialization (exactly as ethers-v6-integration does)
    tx.signature = {
      r: '0x0',
      s: '0x0',
      v: 0,
    };

    // Get serialized RLP hex
    const rlpHex = tx.serialized;

    // Convert to base64
    const rlpBase64 = Buffer.from(rlpHex.slice(2), 'hex').toString('base64');

    logger.info('EVM transaction formatted successfully', { rlpBase64 });
    return rlpBase64;
  } catch (error) {
    logger.error('Failed to format EVM transaction:', formatError(error));
    throw error;
  }
}

/**
 * Formats an EVM message for signing
 * Applies Ethereum signed message prefix
 */
export function formatEVMMessage(message: string): string {
  try {
    logger.info('Formatting EVM message', { message });

    // Apply Ethereum signed message prefix
    const hashedMessage = ethers.hashMessage(message);

    // Convert to base64
    const messageBase64 = Buffer.from(hashedMessage.slice(2), 'hex').toString('base64');

    logger.info('EVM message formatted successfully', { messageBase64 });
    return messageBase64;
  } catch (error) {
    logger.error('Failed to format EVM message:', formatError(error));
    throw error;
  }
}
