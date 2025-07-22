import ParaWeb from '@getpara/react-sdk-lite';
import { ParaProtoSigner } from '@getpara/cosmjs-v0-integration';

export const getCosmjsProtoSigner = async ({
  para,
  prefix,
  walletId,
  messageSigningTimeoutMs,
}: {
  para: ParaWeb;
  prefix?: string;
  walletId?: string;
  messageSigningTimeoutMs?: number;
}) => new ParaProtoSigner(para, prefix, walletId, messageSigningTimeoutMs);
