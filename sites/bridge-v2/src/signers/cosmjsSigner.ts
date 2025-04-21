import { ParaWeb } from '@getpara/web-sdk';
import { ParaProtoSigner, ParaAminoSigner } from '@getpara/cosmjs-v0-integration';
import { base64ToBytes } from '@metamask/utils';
import { logger, formatError } from '../logging';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { StdSignDoc } from '@cosmjs/amino';
import { CosmJsSignersInitArgs, CosmJsSignDirectArgs, CosmJsSignAminoArgs } from '../types';

export async function initCosmJsSigners(para: ParaWeb, args: CosmJsSignersInitArgs) {
  try {
    const { walletId, prefix = 'cosmos', messageSigningTimeoutMs } = args;

    logger.info(
      'initCosmJsSigners called with walletId:',
      walletId,
      'prefix:',
      prefix,
      'messageSigningTimeoutMs:',
      messageSigningTimeoutMs,
    );

    let protoSigner;
    let aminoSigner;

    try {
      protoSigner = new ParaProtoSigner(para, prefix, walletId, messageSigningTimeoutMs);
      window['cosmjsProtoSigner'] = protoSigner;
    } catch (protoErr) {
      logger.error('Error initializing ParaProtoSigner in initCosmJsSigners:', formatError(protoErr));
      throw protoErr;
    }

    try {
      aminoSigner = new ParaAminoSigner(para, prefix, walletId, messageSigningTimeoutMs);
      window['cosmjsAminoSigner'] = aminoSigner;
    } catch (aminoErr) {
      logger.error('Error initializing ParaAminoSigner in initCosmJsSigners:', formatError(aminoErr));
      throw aminoErr;
    }

    logger.info('initCosmJsSigners completed successfully with walletId:', walletId);
    return true;
  } catch (err) {
    logger.error('initCosmJsSigners - Error:', formatError(err));
    throw err;
  }
}

export async function cosmJsSignDirect(args: CosmJsSignDirectArgs) {
  try {
    const { signerAddress, signDocBase64 } = args;

    logger.info('cosmJsSignDirect called with signerAddress:', signerAddress);

    const protoSigner = window['cosmjsProtoSigner'] as ParaProtoSigner;
    if (!protoSigner) {
      const errorMsg = 'cosmJsSignDirect - No cosmjsProtoSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let signDoc;
    try {
      const signDocBytes = base64ToBytes(signDocBase64);
      signDoc = SignDoc.decode(signDocBytes);
    } catch (parseErr) {
      logger.error('Error decoding SignDoc in cosmJsSignDirect:', formatError(parseErr));
      throw parseErr;
    }

    let directSignResponse;
    try {
      directSignResponse = await protoSigner.signDirect(signerAddress, signDoc);
    } catch (signErr) {
      logger.error('Error calling signDirect in cosmJsSignDirect:', formatError(signErr));
      throw signErr;
    }

    logger.info('cosmJsSignDirect completed successfully.');
    return directSignResponse;
  } catch (err) {
    logger.error('cosmJsSignDirect - Error:', formatError(err));
    throw err;
  }
}

export async function cosmJsSignAmino(args: CosmJsSignAminoArgs) {
  try {
    const { signerAddress, signDocBase64 } = args;

    logger.info('cosmJsSignAmino called with signerAddress:', signerAddress);

    const aminoSigner = window['cosmjsAminoSigner'] as ParaAminoSigner;
    if (!aminoSigner) {
      const errorMsg = 'cosmJsSignAmino - No cosmjsAminoSigner found in window.';
      logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    let stdSignDoc;
    try {
      const signDocBytes = base64ToBytes(signDocBase64);
      stdSignDoc = JSON.parse(Buffer.from(signDocBytes).toString('utf-8')) as StdSignDoc;
    } catch (parseErr) {
      logger.error('Error parsing StdSignDoc in cosmJsSignAmino:', formatError(parseErr));
      throw parseErr;
    }

    let aminoSignResponse;
    try {
      aminoSignResponse = await aminoSigner.signAmino(signerAddress, stdSignDoc);
    } catch (signErr) {
      logger.error('Error calling signAmino in cosmJsSignAmino:', formatError(signErr));
      throw signErr;
    }

    logger.info('cosmJsSignAmino completed successfully.');
    return aminoSignResponse;
  } catch (err) {
    logger.error('cosmJsSignAmino - Error:', formatError(err));
    throw err;
  }
}
