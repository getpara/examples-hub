import {
  createContext,
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { OnRampStep, useModalStore } from '../../stores/index.js';
import { useWallet } from '../../../provider/hooks/index.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import {
  EnabledFlow,
  getOnRampAssets,
  getOnRampNetworks,
  Network,
  OnRampAsset,
  OnRampConfig,
  OnRampProvider,
  OnRampPurchaseType,
  WalletType,
} from '@getpara/web-sdk';
import { getNetworkFromChainId, getNetworkOrMainNetEquivalent } from '@getpara/react-common';
import { IconType } from '@getpara/react-components';

export type Tab = EnabledFlow;

export const TABS: [
  Tab,
  keyof Pick<OnRampConfig, 'isBuyEnabled' | 'isReceiveEnabled' | 'isWithdrawEnabled'>,
  IconType,
  ReactNode,
][] = [
  [EnabledFlow.BUY, 'isBuyEnabled', 'creditCard', 'Buy'],
  [EnabledFlow.RECEIVE, 'isReceiveEnabled', 'qrCode', 'Receive'],
  [EnabledFlow.WITHDRAW, 'isWithdrawEnabled', 'arrowCircleBrokenDownLeft', 'Withdraw'],
];

type Value = {
  network: Network | undefined;
  setNetwork: Dispatch<SetStateAction<Value['network']>>;
  asset: OnRampAsset | undefined;
  setAsset: Dispatch<SetStateAction<Value['asset']>>;
  fiatQuantity: string | undefined;
  setFiatQuantity: Dispatch<SetStateAction<Value['fiatQuantity']>>;
  networks: Network[];
  assets: OnRampAsset[];
  isProviderAllowed: Partial<Record<OnRampProvider, boolean>>;
  tab: Tab;
  activeWallet: ReturnType<typeof useWallet>['data'];
  onRampConfig: OnRampConfig;
};

const DEFAULT = {
  networks: [],
  assets: [],
  isProviderAllowed: {},
  tab: TABS[0][0],
  network: undefined,
  setNetwork: () => {},
  asset: undefined,
  setAsset: () => {},
  fiatQuantity: '25.00',
  setFiatQuantity: () => {},
  onRampConfig: {} as OnRampConfig,
  activeWallet: {} as ReturnType<typeof useWallet>['data'],
};

function isValid(
  onRampConfig: OnRampConfig | undefined,
  walletType: WalletType | undefined,
  network: Network | undefined,
  asset: OnRampAsset | undefined,
) {
  return network && asset && walletType ? !!onRampConfig?.assetInfo[walletType]?.[network]?.[asset] : false;
}

export const AddFundsContext = createContext<Value>(DEFAULT);

export function AddFundsContextProvider({ tab, children }: PropsWithChildren<{ tab: Tab }>) {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const onRampStep = useModalStore(state => state.onRampStep);
  const setOnRampStep = useModalStore(state => state.setOnRampStep);
  const { chainId } = useExternalWallets();

  const { data: activeWallet } = useWallet();

  const [fiatQuantity, setFiatQuantity] = useState<string>(onRampConfig?.defaultBuyAmount?.[0] ?? '25.00');

  const networks = useMemo(() => {
    if (!onRampConfig) {
      return [];
    }

    const detectedNetwork = getNetworkFromChainId(chainId);
    const isExternal = activeWallet?.isExternal && !!detectedNetwork;
    return isExternal
      ? [getNetworkOrMainNetEquivalent(detectedNetwork, onRampConfig.testMode)]
      : getOnRampNetworks(onRampConfig.assetInfo, {
          walletType: activeWallet?.type,
          allowed: onRampConfig.allowedAssets ? (Object.keys(onRampConfig.allowedAssets) as Network[]) : undefined,
          providers: onRampConfig.providers,
          action: OnRampPurchaseType[tab === EnabledFlow.BUY ? 'BUY' : 'SELL'],
        });
  }, [chainId, activeWallet, onRampConfig, tab]);

  const assets = useMemo(() => {
    if (!onRampConfig) {
      return [];
    }
    return [
      ...new Set(
        Object.values(
          networks.reduce((acc, network) => {
            const configValue = onRampConfig.allowedAssets?.[network];

            const allowed = configValue === true ? undefined : configValue;

            return {
              ...acc,
              [network]: getOnRampAssets(onRampConfig.assetInfo, {
                walletType: activeWallet?.type,
                network,
                allowed,
                providers: onRampConfig.providers,
                action: OnRampPurchaseType[tab === EnabledFlow.BUY ? 'BUY' : 'SELL'],
              }),
            };
          }, {}),
        ).flat(),
      ),
    ];
  }, [networks, onRampConfig, activeWallet, tab]) as OnRampAsset[];

  const [network, setNetwork] = useState<Network | undefined>(
    !!activeWallet?.type &&
      !!onRampConfig?.defaultOnRampNetwork &&
      !!onRampConfig.assetInfo[activeWallet.type][onRampConfig.defaultOnRampNetwork]
      ? onRampConfig.defaultOnRampNetwork
      : undefined,
  );
  const [asset, setAsset] = useState<OnRampAsset | undefined>(
    !!network && !!onRampConfig?.defaultOnRampAsset && assets.includes(onRampConfig.defaultOnRampAsset)
      ? onRampConfig.defaultOnRampAsset
      : undefined,
  );

  const isProviderAllowed = useMemo(
    () =>
      onRampConfig && !!activeWallet?.type
        ? onRampConfig.providers.reduce(
            (acc, id) => ({
              ...acc,
              [id]:
                !!network &&
                !!asset &&
                !!onRampConfig.assetInfo[activeWallet.type!]?.[network]?.[asset]?.[id]?.[1]?.[
                  tab === EnabledFlow.BUY ? 'BUY' : 'SELL'
                ],
            }),
            {},
          )
        : {},
    [onRampConfig, network, asset, activeWallet, tab],
  );

  const value = useMemo<Value>(() => {
    if (!onRampConfig || !activeWallet) {
      return DEFAULT;
    }

    return {
      tab,
      networks,
      assets: assets as OnRampAsset[],
      isProviderAllowed,
      asset,
      setAsset,
      network,
      setNetwork,
      fiatQuantity,
      setFiatQuantity,
      activeWallet,
      onRampConfig,
    };
  }, [
    tab,
    networks,
    assets,
    isProviderAllowed,
    asset,
    setAsset,
    network,
    setNetwork,
    fiatQuantity,
    setFiatQuantity,
    activeWallet,
    onRampConfig,
  ]);

  useEffect(() => {
    if (!!activeWallet && onRampStep === OnRampStep.PROVIDER && !isValid(onRampConfig, activeWallet!.type, network, asset)) {
      setOnRampStep(OnRampStep.SETTINGS);
    }
  }, [onRampStep, onRampConfig, activeWallet, network, asset, setOnRampStep]);

  return <AddFundsContext.Provider value={value}>{children}</AddFundsContext.Provider>;
}

export const useAddFunds = () => useContext(AddFundsContext);
