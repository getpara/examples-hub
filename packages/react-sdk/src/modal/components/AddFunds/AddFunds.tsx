import {
  EnabledFlow,
  getOnRampAssets,
  getOnRampNetworks,
  Network,
  OnRampAsset,
  OnRampConfig,
  OnRampProvider,
  OnRampPurchaseType,
  toAssetInfoArray,
  WalletType,
} from '@usecapsule/web-sdk';
import { CpslTabsCustomEvent, IconType, TabsChangedEventDetail } from '@usecapsule/core-components';
import { CenteredText, FilledDisabledInput, Heading, InnerStepContainer, QRContainer, StepContainer } from '../common.js';
import {
  CpslButton,
  CpslDivider,
  CpslIcon,
  CpslIdenticon,
  CpslQrCode,
  CpslSpinner,
  CpslTab,
  CpslTabs,
  CpslText,
} from '@usecapsule/react-components';
import { useCapsuleStore, useModalStore, useThemeStore } from '../../stores/index.js';
import { ReactNode, useEffect, useMemo } from 'react';
import { OnRampProviderButton } from '../OnRampComponents/OnRampProviderButton.js';
import { isMobile } from '@usecapsule/web-sdk';
import { useActiveWallet } from '../../hooks/useActiveWallet.js';
import { getAddFundsStep, ModalStep } from '../../utils/steps.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import { getNetworkFromChainId, getNetworkOrMainNetEquivalent, useCopyToClipboard } from '@usecapsule/react-common';
import { formatNetworkList } from '../../utils/stringFormatters.js';
import styled from 'styled-components';

export type Tab = EnabledFlow;

const TABS: [
  Tab,
  keyof Pick<OnRampConfig, 'isBuyEnabled' | 'isReceiveEnabled' | 'isWithdrawEnabled'>,
  IconType,
  ReactNode,
][] = [
  [EnabledFlow.BUY, 'isBuyEnabled', 'creditCard', 'Buy'],
  [EnabledFlow.RECEIVE, 'isReceiveEnabled', 'qrCode', 'Receive'],
  [EnabledFlow.WITHDRAW, 'isWithdrawEnabled', 'arrowCircleBrokenDownLeft', 'Withdraw'],
];

const GENERIC_WALLET = {
  [WalletType.EVM]: 'Ethereum or EVM-based L2s',
  [WalletType.SOLANA]: 'Solana',
  [WalletType.COSMOS]: 'Cosmos',
};

export const AddFunds = () => {
  const [isCopied, copy] = useCopyToClipboard();
  const capsule = useCapsuleStore(state => state.capsule);
  const appName = useThemeStore(state => state.appName);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const storedTab = useModalStore(state => state.accountAddFundTab);
  const setStep = useModalStore(state => state.setStep);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const { chainId } = useExternalWallets();

  const activeWallet = useActiveWallet();

  const tabs = TABS.filter(([, key]) => !!onRampConfig[key]);
  const isMultiFlow = tabs.length > 1;

  const tab = storedTab ?? tabs[0][0];

  const address = useMemo(
    () => (activeWallet ? capsule.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }) : ''),
    [capsule, activeWallet?.id, activeWallet?.type],
  );

  const onSetTab = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setStep(getAddFundsStep(event.detail.tab as Tab));
  };
  const onCopy = () => {
    copy(address);
  };

  const [allowedNetworks, allowedAssets, isProviderAllowed] = useMemo(() => {
    if (!onRampConfig || !activeWallet) {
      return [[], [], {}];
    }
    const action = tab === EnabledFlow.BUY ? OnRampPurchaseType.BUY : OnRampPurchaseType.SELL;

    const detectedNetwork = getNetworkFromChainId(chainId);
    const isExternal = activeWallet.isExternal && !!detectedNetwork;
    const allowedNetworks = isExternal
      ? [getNetworkOrMainNetEquivalent(detectedNetwork, onRampConfig.testMode)]
      : getOnRampNetworks(onRampConfig.assetInfo, {
          walletType: activeWallet.type,
          allowed: onRampConfig.allowedAssets ? (Object.keys(onRampConfig.allowedAssets) as Network[]) : undefined,
        });

    const allowedAssetsLookup: Partial<Record<Network, OnRampAsset[]>> = allowedNetworks.reduce((acc, network) => {
      const configValue = onRampConfig.allowedAssets?.[network];

      const allowed = configValue === true ? undefined : configValue;

      return {
        ...acc,
        [network]: getOnRampAssets(onRampConfig.assetInfo, { walletType: activeWallet.type, network, allowed }),
      };
    }, {});

    const isProviderAllowed = onRampConfig.providers.reduce(
      (acc: Record<OnRampProvider, boolean>, id) => {
        const hasMatch = toAssetInfoArray(onRampConfig.assetInfo).some(([type, network, asset, validProviders]) => {
          return (
            type === activeWallet.type &&
            allowedNetworks.includes(network) &&
            (!allowedAssetsLookup[network] || allowedAssetsLookup[network].includes(asset)) &&
            !!validProviders[id]?.[1]?.[action]
          );
        });

        return {
          ...acc,
          [id]: hasMatch,
        };
      },
      {} as Record<OnRampProvider, boolean>,
    );

    return [allowedNetworks, [...new Set(Object.values(allowedAssetsLookup).flat())], isProviderAllowed];
  }, [activeWallet?.type, activeWallet?.isExternal, tab, onRampConfig.assetInfo, onRampConfig.allowedAssets, chainId]);

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  if (!onRampConfig || !activeWallet) {
    return (
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
    );
  }

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  return (
    <StepContainer>
      {isMultiFlow && (
        <InnerStepContainer>
          <CpslTabs selectedTab={tab} onCpslTabsChanged={onSetTab}>
            {TABS.map(([tab, _, icon, title]) => (
              <CpslTab key={tab} tab={tab}>
                <CpslIcon slot="start" icon={icon} />
                {title}
              </CpslTab>
            ))}
          </CpslTabs>
        </InnerStepContainer>
      )}
      <>
        {[EnabledFlow.BUY, EnabledFlow.WITHDRAW].includes(tab) ? (
          <>
            <Heading variant="headingS" weight="bold">
              Choose Provider
            </Heading>
            <$InnerStepContainer>
              <NoProviders isHidden={Object.values(isProviderAllowed).some(v => !!v)} variant="bodyM">
                No providers are available for this wallet
              </NoProviders>
              <AnimatePresence>
                {onRampConfig.providers.map((id, index) => {
                  return isProviderAllowed[id] ? (
                    <motion.div
                      key={id}
                      style={{ width: '100%' }}
                      layout
                      initial={{ opacity: 0, transform: 'translateX(25px)' }}
                      animate={{ opacity: 1, transform: 'none' }}
                      exit={{ opacity: 0, transform: 'translateX(-25px)' }}
                      transition={{ duration: 0.2 }}
                    >
                      <OnRampProviderButton
                        config={onRampConfig}
                        index={index}
                        key={id}
                        onClick={async () => {
                          if (!activeWallet?.type) return;

                          const isPopup = id !== OnRampProvider.RAMP;

                          const { onRampPurchase: newOnRampPurchase } = await capsule.initiateOnRampTransaction({
                            walletId: activeWallet.isExternal ? undefined : activeWallet.id,
                            externalWalletAddress: activeWallet.isExternal ? activeWallet.id : undefined,
                            shouldOpenPopup: isPopup,
                            params: {
                              type: tab === EnabledFlow.BUY ? OnRampPurchaseType.BUY : OnRampPurchaseType.SELL,
                              walletType: activeWallet.type,
                              provider: id,
                              networks: allowedNetworks,
                              assets: allowedAssets,
                              defaultNetwork: onRampConfig.defaultOnRampNetwork,
                              defaultAsset: onRampConfig.defaultOnRampAsset,
                              fiatQuantity: onRampConfig.defaultBuyAmount?.[0],
                              testMode: onRampConfig.testMode,
                            },
                          });

                          setOnRampPurchase({ ...newOnRampPurchase, fiat: 'USD' });

                          !isPopup && setStep(ModalStep.ADD_FUNDS_AWAITING);
                        }}
                      />
                    </motion.div>
                  ) : null;
                })}
              </AnimatePresence>
            </$InnerStepContainer>
          </>
        ) : (
          <>
            <InnerStepContainer>
              <FilledDisabledInput noAutoDisable key={address} readonly placeholder={address}>
                <CpslIdenticon
                  slot="start"
                  size="32px"
                  hash={capsule.getIdenticonHash(activeWallet.id, activeWallet.type)}
                />
                <CpslButton slot="end" variant="ghost" onClick={onCopy}>
                  <CpslIcon icon={isCopied ? 'check' : 'copy'} />
                </CpslButton>
              </FilledDisabledInput>
            </InnerStepContainer>
            {!isMobile() && (
              <>
                <CpslDivider>or</CpslDivider>
                <InnerStepContainer>
                  <QRContainer>
                    {!address ? <CpslSpinner size={100} /> : <CpslQrCode key={address} url={address} />}
                  </QRContainer>
                  <CpslText weight="semiBold" color="secondary">
                    Scan with your crypto wallet
                  </CpslText>
                </InnerStepContainer>
              </>
            )}
            <InnerStepContainer>
              <CenteredText weight="semiBold">
                {!!onRampConfig.allowedAssets && allowedNetworks.length > 0 ? (appName ?? 'This App') : 'This Wallet'} Only
                Supports:
              </CenteredText>
              <CenteredText weight="medium" color="secondary">
                {!!onRampConfig.allowedAssets && allowedNetworks.length > 0
                  ? formatNetworkList(allowedNetworks)
                  : GENERIC_WALLET[activeWallet.type]}
              </CenteredText>
            </InnerStepContainer>
          </>
        )}
      </>
    </StepContainer>
  );
};

const SpinnerContainer = styled(StepContainer)`
  margin: 50% 0;
`;

const $InnerStepContainer = styled(InnerStepContainer)`
  position: relative;
  min-height: 270px;
`;

const NoProviders = styled(CpslText)<{ isHidden?: boolean }>`
  width: 100%;
  text-align: center;
  visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'visible')};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: visibility 0.2s;
`;
