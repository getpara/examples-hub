import { Chain, WindowProvider } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { InjectedConnectorOptions } from '@wagmi/connectors/injected';

import { Capsule } from '../../Capsule';
import { CapsuleEIP1193Provider } from './CapsuleEIP1193Provider';
import { CoreCapsule } from '../../core/CoreCapsule';

interface CapsuleConnectorOpts {
  chains: Chain[];
  options: InjectedConnectorOptions;
  capsule: Capsule | CoreCapsule;
  disableModal?: boolean;
  appName: string;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
}

export class CapsuleConnector extends InjectedConnector {
  private capsule: Capsule | CoreCapsule;

  constructor({ chains, options, capsule, disableModal, appName, storageOverride }: CapsuleConnectorOpts) {
    if (chains.length === 0) {
      throw new Error('Must provide at least one chain');
    }
    const provider = new CapsuleEIP1193Provider({
      capsule,
      chainId: `${chains[0].id}`,
      chains,
      disableModal,
      appName,
      storageOverride,
    });

    const optionsWithProvider = {
      name: 'Capsule',
      getProvider() {
        return provider as unknown as WindowProvider;
      },
      ...options,
    };
    super({ chains, options: optionsWithProvider });
    this.capsule = capsule;
  }

  async disconnect() {
    await super.disconnect();
    this.capsule.logout();
  }
}
