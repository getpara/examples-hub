import type { CreateConnectorFn } from 'wagmi';
import { uniqueBy } from '../utils/uniqueBy.js';
import type { WalletDetailsParams, WalletList } from '../types/Wallet.js';
import type { ParaWalletConnectParameters, Wallet } from '../types/Wallet.js';
import { computeWalletConnectMetaData } from '../utils/computeWalletConnectMetaData.js';
import { omitUndefinedValues } from '../utils/omitUndefinedValues.js';
import { TExternalWallet } from '@getpara/react-common';
import ParaWeb from '@getpara/web-sdk';

export interface WalletListItem extends Wallet {
  index: number;
}

export interface ConnectorsForWalletsParameters {
  para: ParaWeb;
  createFarcasterConnector?: () => any;
  projectId: string;
  appName: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
  walletConnectParameters?: ParaWalletConnectParameters;
}

export const connectorsForWallets = (
  walletList: WalletList,
  {
    para,
    projectId,
    walletConnectParameters,
    appName,
    appDescription,
    appUrl,
    appIcon,
    createFarcasterConnector,
  }: ConnectorsForWalletsParameters,
): CreateConnectorFn[] => {
  if (!walletList.length) {
    return [];
  }

  let index = -1;

  const connectors: CreateConnectorFn[] = [];
  const wallets: WalletListItem[] = [];

  const walletConnectMetaData = computeWalletConnectMetaData({
    appName,
    appDescription,
    appUrl,
    appIcon,
  });

  walletList.forEach(createWallet => {
    index++;

    const wallet = createWallet({
      para,
      projectId,
      appName,
      appIcon,
      // `option` is being used only for `walletConnectWallet` wallet
      options: {
        metadata: walletConnectMetaData,
        ...walletConnectParameters,
      },
      // Every other wallet that supports walletConnect flow and is not
      // `walletConnectWallet` wallet will have `walletConnectParameters` property
      walletConnectParameters: {
        metadata: walletConnectMetaData,
        ...walletConnectParameters,
      },
      createFarcasterConnector,
    });

    const walletListItem = {
      ...wallet,
      index,
    };

    wallets.push(walletListItem);
  });

  // Filtering out duplicated wallets in case there is any.
  // We process the known visible wallets first so that the potentially
  // hidden wallets have access to the complete list of resolved wallets
  const walletListItems: WalletListItem[] = uniqueBy([...wallets], 'id');

  for (const { createConnector, ...walletMeta } of walletListItems) {
    const walletMetaData = (
      // For now we should only use these as the additional parameters
      additionalParaParams?: Pick<WalletDetailsParams['paraDetails'], 'isWalletConnectModalConnector' | 'showQrModal'> & {
        id?: TExternalWallet;
        rdns?: string;
      },
    ) => {
      return {
        paraDetails: omitUndefinedValues({
          ...walletMeta,
          isParaConnector: true,
          // These additional params will be used in Para react tree to
          // merge `walletConnectWallet` and `walletConnect` connector from wagmi with
          // showQrModal: true. This way we can let the user choose if they want to
          // connect via QR code or open the official walletConnect modal instead
          ...(additionalParaParams ? additionalParaParams : {}),
        }),
      };
    };

    const isWalletConnectConnector = walletMeta.internalId === 'WALLETCONNECT';

    if (isWalletConnectConnector && createConnector) {
      connectors.push(
        createConnector(
          walletMetaData({
            isWalletConnectModalConnector: true,
            showQrModal: true,
          }),
        ),
      );
    }

    if (createConnector) {
      connectors.push(createConnector(walletMetaData()));
    }
  }

  return connectors;
};
