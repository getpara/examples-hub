import ParaWeb from '@getpara/react-sdk-lite';
import { ParaAminoSigner } from '@getpara/cosmjs-v0-integration';

export const getCosmjsAminoSigner = async ({
  para,
  prefix,
  walletId,
  messageSigningTimeoutMs,
}: {
  para: ParaWeb;
  prefix?: string;
  walletId?: string;
  messageSigningTimeoutMs?: number;
}) => new ParaAminoSigner(para, prefix, walletId, messageSigningTimeoutMs);
