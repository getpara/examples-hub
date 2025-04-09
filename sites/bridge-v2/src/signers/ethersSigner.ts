import { ethers } from 'ethers';
import { base64ToBytes } from '@metamask/utils';
import { ParaWeb } from '@getpara/web-sdk';
import { ParaEthersSigner } from '@getpara/ethers-v6-integration';
import { logger, formatError } from '../logging';

export async function initEthersSigner(para: ParaWeb, args: any[]) {
  try {
    const walletId = args[0];
    const providerUrl = args[1];

    logger.info('initEthersSigner called with walletId:', walletId, 'providerUrl:', providerUrl);

    let provider;
    try {
      provider = new ethers.JsonRpcProvider(providerUrl);
    } catch (providerErr) {
      logger.error('Error creating JsonRpcProvider in initEthersSigner:', formatError(providerErr));
      throw providerErr;
    }

    let ethersSigner;
    try {
      ethersSigner = new ParaEthersSigner(para, provider, walletId);
      window['ethersSigner'] = ethersSigner;
    } catch (signerErr) {
      logger.error('Error initializing ParaEthersSigner in initEthersSigner:', formatError(signerErr));
      throw signerErr;
    }

    logger.info('initEthersSigner completed successfully with walletId:', walletId);
    return true;
  } catch (err) {
    logger.error('initEthersSigner - Error:', formatError(err));
    throw err;
  }
}

export async function ethersSignMessage(args: any[]) {
  try {
    const message = args[0];
    logger.info('ethersSignMessage called with message:', message);

    const ethersSigner = window['ethersSigner'] as ParaEthersSigner;
    if (!ethersSigner) {
      const errorMsg = 'ethersSignMessage - No ethersSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let signature;
    try {
      signature = await ethersSigner.signMessage(message);
    } catch (signErr) {
      logger.error('Error signing message in ethersSignMessage:', formatError(signErr));
      throw signErr;
    }

    logger.info('ethersSignMessage completed successfully. Signature:', signature);
    return signature;
  } catch (err) {
    logger.error('ethersSignMessage - Error:', formatError(err));
    throw err;
  }
}

export async function ethersSignTransaction(args: any[]) {
  try {
    const b64EncodedTx = args[0];
    logger.info('ethersSignTransaction called with base64 transaction:', b64EncodedTx);

    let txBytes;
    let jsonString;
    let jsonTx;
    try {
      txBytes = base64ToBytes(b64EncodedTx);
      const decoder = new TextDecoder();
      jsonString = decoder.decode(txBytes);
      jsonTx = JSON.parse(jsonString);
    } catch (parseErr) {
      logger.error('Error parsing transaction in ethersSignTransaction:', formatError(parseErr));
      throw parseErr;
    }

    const ethersSigner = window['ethersSigner'] as ParaEthersSigner;
    if (!ethersSigner) {
      const errorMsg = 'ethersSignTransaction - No ethersSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let signature;
    try {
      signature = ethersSigner.signTransaction(jsonTx);
    } catch (signErr) {
      logger.error('Error signing transaction in ethersSignTransaction:', formatError(signErr));
      throw signErr;
    }

    logger.info('ethersSignTransaction completed successfully. Signature:', signature);
    return signature;
  } catch (err) {
    logger.error('ethersSignTransaction - Error:', formatError(err));
    throw err;
  }
}

export async function ethersSendTransaction(args: any[]) {
  try {
    const b64EncodedTx = args[0];
    logger.info('ethersSendTransaction called with base64 transaction:', b64EncodedTx);

    let txBytes;
    let jsonString;
    let jsonTx;
    try {
      txBytes = base64ToBytes(b64EncodedTx);
      const decoder = new TextDecoder();
      jsonString = decoder.decode(txBytes);
      jsonTx = JSON.parse(jsonString);
    } catch (parseErr) {
      logger.error('Error parsing transaction in ethersSendTransaction:', formatError(parseErr));
      throw parseErr;
    }

    const ethersSigner = window['ethersSigner'] as ParaEthersSigner;
    if (!ethersSigner) {
      const errorMsg = 'ethersSendTransaction - No ethersSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let txResponse;
    try {
      txResponse = await ethersSigner.sendTransaction(jsonTx);
    } catch (sendErr) {
      logger.error('Error sending transaction in ethersSendTransaction:', formatError(sendErr));
      throw sendErr;
    }

    logger.info('ethersSendTransaction completed successfully. TxResponse:', txResponse);
    return txResponse;
  } catch (err) {
    logger.error('ethersSendTransaction - Error:', formatError(err));
    throw err;
  }
}

export async function ethersSignTypedData(args: any[]) {
  try {
    const domain = args[0];
    const types = args[1];
    const value = args[2];

    logger.info('ethersSignTypedData called with domain:', domain, 'types:', types, 'value:', value);

    const ethersSigner = window['ethersSigner'] as ParaEthersSigner;
    if (!ethersSigner) {
      const errorMsg = 'ethersSignTypedData - No ethersSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let signature;

    try {
      signature = await ethersSigner.signTypedData(domain, types, value);
    } catch (signErr) {
      logger.error('Error signing typed data in ethersSignTypedData:', formatError(signErr));
      throw signErr;
    }

    logger.info('ethersSignTypedData completed successfully. Signature:', signature);
    return signature;
  } catch (err) {
    logger.error('ethersSignTypedData - Error:', formatError(err));
    throw err;
  }
}
