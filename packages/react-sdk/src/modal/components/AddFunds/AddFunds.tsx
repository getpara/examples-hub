import {
  EnabledFlow,
  getOnRampAssets,
  getOnRampNetworks,
  Network,
  OnRampAsset,
  OnRampConfig,
  OnRampProvider,
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
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import { OnRampProviderButton } from '../OnRampComponents/OnRampProviderButton.js';
import { isMobile } from '@usecapsule/web-sdk';
import { useActiveWallet } from '../../hooks/useActiveWallet.js';
import { ModalStep } from '../../utils/steps.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import { getNetworkFromChainId, getNetworkOrMainNetEquivalent } from '../../utils/onRamps.js';
import { formatNetworkList } from '../../utils/stringFormatters.js';
import styled from 'styled-components';

export type Tab = EnabledFlow;

const TABS: [Tab, keyof Pick<OnRampConfig, 'isBuyEnabled' | 'isReceiveEnabled'>, IconType, ReactNode][] = [
  [EnabledFlow.BUY, 'isBuyEnabled', 'creditCard', 'Buy'],
  [EnabledFlow.RECEIVE, 'isReceiveEnabled', 'qrCode', 'Receive'],
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
  const tab = useModalStore(state => state.accountAddFundTab);
  const setTab = useModalStore(state => state.setAccountAddFundTab);
  const setStep = useModalStore(state => state.setStep);
  const setOnRampPurchase = useModalStore(state => state.setOnRampPurchase);
  const { chainId } = useExternalWallets();

  const activeWallet = useActiveWallet();

  const tabs = TABS.filter(([, key]) => !!onRampConfig[key]);
  const isMultiFlow = tabs.length > 1;

  const address = useMemo(
    () => capsule.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }),
    [capsule, activeWallet?.id, activeWallet?.type],
  );

  const onSetTab = (event: CpslTabsCustomEvent<TabsChangedEventDetail>) => {
    setTab(event.detail.tab as Tab);
  };
  const onCopy = () => {
    copy(address);
  };

  const [allowedNetworks, allowedAssets, isProviderAllowed] = useMemo(() => {
    if (!onRampConfig) {
      return [[], [], {}];
    }

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
          if (onRampConfig.testMode && network !== Network.ETHEREUM && asset !== OnRampAsset.ETHEREUM && id === 'RAMP') {
            return false;
          }

          return (
            type === activeWallet.type &&
            allowedNetworks.includes(network) &&
            (!allowedAssetsLookup[network] || allowedAssetsLookup[network].includes(asset)) &&
            !!validProviders[id]
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
  }, [activeWallet?.type, onRampConfig.assetInfo, onRampConfig.allowedAssets, chainId]);

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  useEffect(() => {
    setOnRampPurchase(undefined);
  }, []);

  if (!onRampConfig) {
    return (
      <SpinnerContainer>
        <CpslSpinner />
      </SpinnerContainer>
    );
  }

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
        {tab === EnabledFlow.BUY ? (
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

                          const newOnRampPurchase = await capsule.createOnRampPurchase({
                            provider: id,
                            networks: allowedNetworks,
                            assets: allowedAssets,
                            testMode: onRampConfig.testMode,
                            walletType: activeWallet.type,
                            [activeWallet.isExternal ? 'externalWalletAddress' : 'walletId']: activeWallet.id,
                          });

                          setOnRampPurchase(newOnRampPurchase);

                          setStep(ModalStep.ADD_FUNDS_AWAITING);
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
              <CpslText weight="semiBold" color="secondary">
                Copy wallet address
              </CpslText>
              <FilledDisabledInput autoselect key={address} readonly value={address}>
                <CpslIdenticon
                  slot="start"
                  variant="avatar"
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
                  <CpslText weight="semiBold" color="secondary">
                    Scan with your crypto wallet
                  </CpslText>
                  <QRContainer>
                    {!address ? <CpslSpinner size={100} /> : <CpslQrCode key={address} url={address} />}
                  </QRContainer>
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
