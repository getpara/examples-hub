import { Chain } from 'wagmi/chains';
import { InjectedParameters, injected } from 'wagmi/connectors';

import { CapsuleEIP1193Provider } from './CapsuleEIP1193Provider';
import CapsuleWeb from '@usecapsule/react-sdk';
import { createConnector } from 'wagmi';

interface CapsuleConnectorOpts {
  chains: Chain[];
  options: InjectedParameters;
  capsule: CapsuleWeb;
  disableModal?: boolean;
  appName: string;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
}

export const capsuleConnector = ({
  capsule,
  chains,
  disableModal,
  appName,
  storageOverride,
  options,
}: CapsuleConnectorOpts) => {
  return createConnector((config) => {
    const injectedObj = injected({
      target: {
        name: 'Capsule',
        id: 'capsule',
        provider: new CapsuleEIP1193Provider({
          capsule,
          chainId: `${chains[0].id}`,
          chains,
          disableModal,
          appName,
          storageOverride,
        }),
      },
      ...options,
    })(config);

    return {
      ...injectedObj,
      disconnect: async () => {
        await injectedObj.disconnect();
        capsule.logout();
      },
    };
  });
};
