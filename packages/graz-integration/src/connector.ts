import { ChainInfo } from '@keplr-wallet/types';
import {
  ParaGrazConnector as CoreParaGrazConnector,
  ParaGrazConfig as CoreParaGrazConfig,
  toArray,
} from '@getpara/graz-connector';
import { ParaModalProps as CoreParaModalProps } from '@getpara/react-sdk-lite';
import { renderModal } from './connectorModal.js';
import { QueryClient } from '@tanstack/react-query';

export type ParaModalProps = Omit<CoreParaModalProps, 'isOpen' | 'para'> & { appName: string };

export interface ParaGrazConfig extends CoreParaGrazConfig {
  modalProps?: ParaModalProps;
  queryClient?: QueryClient;
}

export class ParaGrazConnector extends CoreParaGrazConnector {
  protected isModalClosed = true;
  declare protected config: ParaGrazConfig;

  constructor(config: ParaGrazConfig, chains?: ChainInfo[] | null) {
    super(config, chains);
  }

  protected async waitForLogin(timeoutMs = 60_000): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    let delay = 500;
    const MAX_DELAY = 5_000;

    while (true) {
      if (await this.paraWebClient.isFullyLoggedIn()) {
        return;
      }

      if (this.isModalClosed) {
        throw new Error('Login modal closed by user');
      }

      if (Date.now() >= deadline) {
        throw new Error(`Login timeout after ${timeoutMs / 1000}s`);
      }

      await new Promise(r => setTimeout(r, delay));
      delay = Math.min(delay * 1.5, MAX_DELAY);
    }
  }

  async enable(chainIdsInput: string | string[]): Promise<void> {
    const chainIds = toArray(chainIdsInput);
    const previousEnabled = new Set(this.enabledChainIds);

    try {
      chainIds.forEach(id => this.enabledChainIds.add(id));

      if (await this.hasCosmosWallet()) {
        this.events?.onEnabled?.(chainIds, this);
        return;
      }

      this.isModalClosed = false;

      await renderModal(
        this.paraWebClient,
        this.config.modalProps ?? {},
        () => {
          this.isModalClosed = true;
        },
        this.config.queryClient!,
      );

      await this.waitForLogin();
      await this.waitForAccounts();

      this.events?.onEnabled?.(chainIds, this);
    } catch (err) {
      this.enabledChainIds = previousEnabled;

      if (err instanceof Error) {
        throw err;
      }

      throw new Error('Failed to enable Para wallet with modal');
    } finally {
      this.isModalClosed = true;
    }
  }
}
