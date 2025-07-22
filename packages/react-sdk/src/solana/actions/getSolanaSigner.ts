import ParaWeb from '@getpara/react-sdk-lite';
import { createParaSolanaSigner } from '@getpara/solana-signers-v2-integration';
import { SolanaRpcApi } from '@solana/rpc-api';
import { Rpc } from '@solana/rpc-spec';

export const getSolanaSigner = async ({
  para,
  rpc,
  walletId,
}: {
  para: ParaWeb;
  walletId?: string;
  rpc: Rpc<SolanaRpcApi>;
}) => createParaSolanaSigner({ para, rpc, walletId });
