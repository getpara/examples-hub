import { Chain } from 'wagmi/chains';
import { InjectedParameters, injected } from 'wagmi/connectors';

import { ParaEIP1193Provider } from './ParaEIP1193Provider.js';
import ParaWeb, { ParaModalProps } from '@getpara/react-sdk';
import { createConnector } from 'wagmi';
import { Transport } from 'viem';

const PARA_ID = 'para';
const PARA_NAME = 'Para';
const PARA_ICON =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjE2IiBoZWlnaHQ9IjIwNCIgdmlld0JveD0iMCAwIDIxNiAyMDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik02MCAwSDE0NEMxODMuNzY0IDAgMjE2IDMyLjIzNTUgMjE2IDcyQzIxNiAxMTEuNzY1IDE4My43NjQgMTQ0IDE0NCAxNDRIOTZDODIuNzQ1MiAxNDQgNzIgMTU0Ljc0NSA3MiAxNjhWMjA0SDBWMTMySDM2QzQ5LjI1NDggMTMyIDYwIDEyMS4yNTUgNjAgMTA4TDYwIDBaIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K';

interface ParaConnectorOpts extends Partial<ParaModalProps> {
  /**
   * @deprecated Use `chains` in the wagmi config instead.
   */
  chains?: Chain[];
  options: InjectedParameters;
  para: ParaWeb;
  disableModal?: boolean;
  appName: string;
  idOverride?: string;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
  iconOverride?: string;
  nameOverride?: string;
  transports?: Record<number, Transport>;
}

export const paraConnector = ({
  para,
  chains: _chains,
  disableModal,
  storageOverride,
  options,
  iconOverride,
  nameOverride,
  idOverride,
  transports,
  ...modalProps
}: ParaConnectorOpts) => {
  return createConnector(config => {
    const chains = [...config.chains];
    const eip1193Provider = new ParaEIP1193Provider({
      para,
      chainId: `${chains[0].id}`,
      chains,
      disableModal,
      storageOverride,
      transports: transports || config.transports,
      ...modalProps,
    });

    const injectedObj = injected({
      target: {
        name: PARA_NAME,
        id: idOverride ?? PARA_ID,
        provider: eip1193Provider,
      },
      ...options,
    })(config);

    return {
      ...injectedObj,
      type: idOverride ?? PARA_ID,
      name: nameOverride ?? PARA_NAME,
      icon: iconOverride ?? PARA_ICON,
      disconnect: async () => {
        eip1193Provider.closeModal();
        await injectedObj.disconnect();
        para.logout();
      },
    };
  });
};
