import ParaWeb, { ConstructorOpts, Environment, ParaModalProps } from '@getpara/react-sdk-lite';
import type { Wallet, WalletDetailsParams } from '@rainbow-me/rainbowkit';
import { paraConnector } from '@getpara/wagmi-v2-integration';
import { createConnector } from 'wagmi';
import type { QueryClient } from '@tanstack/react-query';

export interface GetParaOpts extends Partial<Omit<ParaModalProps, 'para'>> {
  para:
    | {
        environment?: Environment;
        apiKey: string;
        constructorOpts?: ConstructorOpts;
      }
    | ParaWeb;
  queryClient: QueryClient;
  appName: string;
}

export function getParaWallet(opts: GetParaOpts) {
  const { para, queryClient, ...modalProps } = opts;

  let paraClass: ParaWeb;

  if (opts.para instanceof ParaWeb) {
    paraClass = opts.para;
  } else if (para && typeof para === 'object' && 'apiKey' in para) {
    paraClass = new ParaWeb(para.environment, para.apiKey, para.constructorOpts);
  } else {
    throw new Error('Invalid para configuration: must be either a ParaWeb instance or an object with apiKey');
  }

  return (_opts: { projectId: string }): Wallet => ({
    id: 'para',
    name: 'Para',
    iconUrl: async () => (await import('./paraWalletImage.js')).default,
    iconBackground: '#000000',
    createConnector: (walletDetails: WalletDetailsParams) =>
      createConnector(config => ({
        ...paraConnector({
          para: paraClass,
          chains: [...config.chains],
          options: {},
          queryClient,
          ...modalProps,
        })(config),
        ...walletDetails,
      })),
  });
}
