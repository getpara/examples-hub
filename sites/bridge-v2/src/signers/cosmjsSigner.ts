import { ParaWeb } from '@getpara/web-sdk';
import { ParaProtoSigner, ParaAminoSigner } from '@getpara/cosmjs-v0-integration';
import { logger, formatError } from '../logging';
import { StargateClient } from '@cosmjs/stargate';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { StdSignDoc } from '@cosmjs/amino';
import { base64ToBytes } from '@metamask/utils';
import { CosmJsSignersInitArgs, CosmJsSignDirectArgs, CosmJsSignAminoArgs } from '../types';

export async function initCosmJsSigners(para: ParaWeb, args: CosmJsSignersInitArgs) {
  const { walletId, prefix = 'cosmos', messageSigningTimeoutMs } = args;

  logger.info('initCosmJsSigners called', { walletId, prefix, messageSigningTimeoutMs });

  const protoSigner = new ParaProtoSigner(para, prefix, walletId, messageSigningTimeoutMs);
  const aminoSigner = new ParaAminoSigner(para, prefix, walletId, messageSigningTimeoutMs);

  window['cosmjsProtoSigner'] = protoSigner;
  window['cosmjsAminoSigner'] = aminoSigner;

  logger.info('initCosmJsSigners completed successfully');
  return true;
}

export async function cosmJsGetBalance(args: { address: string; denom?: string; rpcUrl?: string }) {
  const { address, denom = 'uatom', rpcUrl } = args;
  logger.info('cosmJsGetBalance called', { address, denom, rpcUrl });

  const client = await StargateClient.connect(rpcUrl || 'https://rpc.cosmos.directory/cosmoshub');

  try {
    const balances = await client.getAllBalances(address);
    const balance = balances.find(b => b.denom === denom) || { denom, amount: '0' };

    logger.info('cosmJsGetBalance completed successfully', { balance });
    return balance;
  } finally {
    client.disconnect();
  }
}

export async function cosmJsSignDirect(args: CosmJsSignDirectArgs) {
  const { signerAddress, signDocBase64 } = args;
  logger.info('cosmJsSignDirect called', { signerAddress });

  const protoSigner = window['cosmjsProtoSigner'] as ParaProtoSigner;
  if (!protoSigner) {
    throw new Error('Proto signer not initialized. Call initCosmJsSigners first.');
  }

  try {
    const signDocBytes = base64ToBytes(signDocBase64);
    const signDoc = SignDoc.decode(signDocBytes);

    const result = await protoSigner.signDirect(signerAddress, signDoc);
    logger.info('cosmJsSignDirect completed successfully');
    return result;
  } catch (error) {
    logger.error('cosmJsSignDirect failed:', formatError(error));
    throw error;
  }
}

export async function cosmJsSignAmino(args: CosmJsSignAminoArgs) {
  const { signerAddress, signDocBase64 } = args;
  logger.info('cosmJsSignAmino called', { signerAddress });

  const aminoSigner = window['cosmjsAminoSigner'] as ParaAminoSigner;
  if (!aminoSigner) {
    throw new Error('Amino signer not initialized. Call initCosmJsSigners first.');
  }

  try {
    const signDocBytes = base64ToBytes(signDocBase64);
    const signDocJson = Buffer.from(signDocBytes).toString('utf-8');
    const signDoc = JSON.parse(signDocJson) as StdSignDoc;

    const result = await aminoSigner.signAmino(signerAddress, signDoc);
    logger.info('cosmJsSignAmino completed successfully');
    return result;
  } catch (error) {
    logger.error('cosmJsSignAmino failed:', formatError(error));
    throw error;
  }
}
