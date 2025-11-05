import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { base64ToBytes } from '@metamask/utils';
import { ParaSolanaWeb3Signer } from '@getpara/solana-web3.js-v1-integration';
import { ParaWeb } from '@getpara/web-sdk';
import { logger, formatError } from '../logging';

export async function initSolanaWeb3Signer(para: ParaWeb, args: any[]) {
  try {
    const walletId = args[0];
    const rpcUrl = args[1];
    logger.info('initSolanaSigner called with walletId:', walletId, 'rpcUrl:', rpcUrl);

    let connection;
    try {
      connection = new Connection(rpcUrl);
    } catch (connErr) {
      logger.error('Error creating Solana connection in initSolanaSigner:', formatError(connErr));
      throw connErr;
    }

    let solanaSigner;
    try {
      solanaSigner = new ParaSolanaWeb3Signer(para, connection, walletId);
      window['solanaSigner'] = solanaSigner;
    } catch (signerErr) {
      logger.error('Error initializing ParaSolanaWeb3Signer in initSolanaSigner:', formatError(signerErr));
      throw signerErr;
    }

    logger.info('initSolanaSigner completed successfully with walletId:', walletId);
    return true;
  } catch (err) {
    logger.error('initSolanaSigner - Error:', formatError(err));
    throw err;
  }
}

export async function solanaWeb3SignTransaction(args: any[]) {
  try {
    const b64EncodedTx = args[0];
    logger.info('solanaSignTransaction called with base64 transaction:', b64EncodedTx);

    let txBytes;
    try {
      txBytes = base64ToBytes(b64EncodedTx);
    } catch (parseErr) {
      logger.error('Error parsing transaction bytes in solanaSignTransaction:', formatError(parseErr));
      throw parseErr;
    }

    const solanaSigner = window['solanaSigner'] as ParaSolanaWeb3Signer;
    if (!solanaSigner) {
      const errorMsg = 'solanaSignTransaction - No solanaSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let transaction;
    try {
      transaction = Transaction.from(txBytes);
    } catch (txErr) {
      logger.error('Error creating Transaction in solanaSignTransaction:', formatError(txErr));
      throw txErr;
    }

    let signedTx;
    try {
      signedTx = await solanaSigner.signTransaction(transaction);
    } catch (signErr) {
      logger.error('Error signing transaction in solanaSignTransaction:', formatError(signErr));
      throw signErr;
    }

    const serialized = signedTx.serialize();
    const serializedB64 = Buffer.from(serialized).toString('base64');
    logger.info('solanaSignTransaction completed successfully.');
    return serializedB64;
  } catch (err) {
    logger.error('solanaSignTransaction - Error:', formatError(err));
    throw err;
  }
}

export async function solanaWeb3SignVersionedTransaction(args: any[]) {
  try {
    const b64EncodedTx = args[0];
    logger.info('solanaSignVersionedTransaction called with base64 transaction:', b64EncodedTx);

    let txBytes;
    try {
      txBytes = base64ToBytes(b64EncodedTx);
    } catch (parseErr) {
      logger.error('Error parsing transaction bytes in solanaSignVersionedTransaction:', formatError(parseErr));
      throw parseErr;
    }

    const solanaSigner = window['solanaSigner'] as ParaSolanaWeb3Signer;
    if (!solanaSigner) {
      const errorMsg = 'solanaSignVersionedTransaction - No solanaSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let versionedTx;
    try {
      versionedTx = VersionedTransaction.deserialize(txBytes);
    } catch (vtxErr) {
      logger.error('Error creating VersionedTransaction in solanaSignVersionedTransaction:', formatError(vtxErr));
      throw vtxErr;
    }

    let signedTx;
    try {
      signedTx = await solanaSigner.signVersionedTransaction(versionedTx);
    } catch (signErr) {
      logger.error('Error signing versioned transaction in solanaSignVersionedTransaction:', formatError(signErr));
      throw signErr;
    }

    const serialized = signedTx.serialize();
    const serializedB64 = Buffer.from(serialized).toString('base64');
    logger.info('solanaSignVersionedTransaction completed successfully.');
    return serializedB64;
  } catch (err) {
    logger.error('solanaSignVersionedTransaction - Error:', formatError(err));
    throw err;
  }
}

export async function solanaWeb3SendTransaction(args: any[]) {
  try {
    const b64EncodedTx = args[0];
    logger.info('solanaSendTransaction called with base64 transaction:', b64EncodedTx);

    let txBytes;
    try {
      txBytes = base64ToBytes(b64EncodedTx);
    } catch (parseErr) {
      logger.error('Error parsing transaction bytes in solanaSendTransaction:', formatError(parseErr));
      throw parseErr;
    }

    const solanaSigner = window['solanaSigner'] as ParaSolanaWeb3Signer;
    if (!solanaSigner) {
      const errorMsg = 'solanaSendTransaction - No solanaSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let transaction;
    let isVersioned = false;
    try {
      transaction = VersionedTransaction.deserialize(txBytes);
      isVersioned = true;
    } catch {
      try {
        transaction = Transaction.from(txBytes);
      } catch (txErr) {
        logger.error('Error creating transaction in solanaSendTransaction:', formatError(txErr));
        throw txErr;
      }
    }

    let signature;
    try {
      signature = await solanaSigner.sendTransaction(transaction, { skipPreflight: false });
    } catch (sendErr) {
      logger.error('Error sending transaction in solanaSendTransaction:', formatError(sendErr));
      throw sendErr;
    }

    logger.info('solanaSendTransaction completed successfully. Signature:', signature, 'Versioned:', isVersioned);
    return signature;
  } catch (err) {
    logger.error('solanaSendTransaction - Error:', formatError(err));
    throw err;
  }
}
