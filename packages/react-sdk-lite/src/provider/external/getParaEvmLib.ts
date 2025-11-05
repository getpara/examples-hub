import paraEvmLib from '@getpara/evm-wallet-connectors';

export const getParaEvmLib = async () => {
  let lib: typeof paraEvmLib | undefined;

  try {
    // @ts-ignore
    lib = await import('@getpara/evm-wallet-connectors');
  } catch {
    lib = undefined;
  }

  return { lib };
};
