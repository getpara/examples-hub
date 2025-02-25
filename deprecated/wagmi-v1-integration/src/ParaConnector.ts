import { Chain, WindowProvider } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { InjectedConnectorOptions } from '@wagmi/connectors/injected';

import { ParaEIP1193Provider } from './ParaEIP1193Provider.js';
import ParaWeb, { ParaModalProps } from '@getpara/react-sdk';

interface ParaConnectorOpts extends Partial<ParaModalProps> {
  chains: Chain[];
  options: InjectedConnectorOptions;
  para: ParaWeb;
  disableModal?: boolean;
  storageOverride?: Pick<Storage, 'setItem' | 'getItem'>;
}

export class ParaConnector extends InjectedConnector {
  private para: ParaWeb;

  constructor({ chains, options, para, disableModal, storageOverride, ...modalProps }: ParaConnectorOpts) {
    if (chains.length === 0) {
      throw new Error('Must provide at least one chain');
    }
    const provider = new ParaEIP1193Provider({
      para,
      chainId: `${chains[0].id}`,
      chains,
      disableModal,
      storageOverride,
      ...modalProps,
    });

    const optionsWithProvider = {
      name: 'Para',
      getProvider() {
        return provider as unknown as WindowProvider;
      },
      ...options,
    };
    super({ chains, options: optionsWithProvider });
    this.para = para;
  }

  async disconnect() {
    await super.disconnect();
    this.para.logout();
  }
}
