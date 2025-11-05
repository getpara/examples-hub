import paraSolanaLib from '@getpara/solana-wallet-connectors';

export const getParaSolanaLib = async () => {
  let lib: typeof paraSolanaLib | undefined;

  try {
    // @ts-ignore
    lib = await import('@getpara/solana-wallet-connectors');
  } catch {
    lib = undefined;
  }

  return { lib };
};
