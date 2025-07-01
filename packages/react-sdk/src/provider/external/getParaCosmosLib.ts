import paraCosmosLib from '@getpara/cosmos-wallet-connectors';

export const getParaCosmosLib = async () => {
  let lib: typeof paraCosmosLib | undefined;

  try {
    // @ts-ignore
    lib = await import('@getpara/cosmos-wallet-connectors');
  } catch (e) {
    lib = undefined;
  }

  return { lib };
};
