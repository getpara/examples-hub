import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useAddFunds } from './AddFundsContext.js';
import { CpslButton, CpslIcon, CpslRow, CpslText } from '@getpara/react-components';
import {
  AssetIcon,
  contentMotionProps,
  HeaderSelect,
  HeaderSelectContainer,
  HeaderSelectItem,
  NetworkIcon,
} from '../common.js';
import { QuantityInput } from '../QuantityInput.js';
import { EnabledFlow, getOnRampNetworks, TNetwork, TOnRampAsset, OnRampPurchaseType } from '@getpara/web-sdk';
import { OnRampStep, useModalStore } from '../../stores/index.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { safeStyled, getAssetCode, getNetworkName } from '@getpara/react-common';
import { NoProviders } from './common.js';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { AddFundsAsset } from './AddFundsAsset.js';

function NetworkPill({
  network,
  gap = '4px',
  slot,
  start,
  fix = false,
}: {
  network: TNetwork;
  gap?: string;
  slot?: string;
  start?: ReactNode;
  fix?: boolean;
}) {
  return (
    <CpslRow gap={gap} {...(slot ? { slot } : {})}>
      {start}
      <NetworkIcon network={network} size="24px" />
      <CpslText variant="bodyXS" color="contrast" style={fix ? { marginRight: '8px' } : undefined}>
        {getNetworkName(network)}
      </CpslText>
    </CpslRow>
  );
}

function AssetPill({ asset, gap = '4px', slot, fix }: { asset: TOnRampAsset; gap?: string; slot?: string; fix?: boolean }) {
  if (!asset) {
    return null;
  }
  return (
    <CpslRow gap={gap} {...(slot ? { slot } : {})}>
      <AssetIcon asset={asset} size="24px" />
      <CpslText variant="bodyXS" color="contrast" style={fix ? { marginRight: '8px' } : undefined}>
        {getAssetCode(asset)}
      </CpslText>
    </CpslRow>
  );
}

const NetworkLabel = (
  <CpslText variant="bodyXS" color="secondary" style={{ margin: '0 8px' }}>
    Network
  </CpslText>
);

export function AddFundsSettings() {
  const isPresent = useIsPresent();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const setOnRampStep = useModalStore(state => state.setOnRampStep);
  const {
    assets,
    networks,
    asset,
    setAsset,
    network,
    setNetwork,
    fiatQuantity,
    setFiatQuantity,
    onRampConfig,
    activeWallet,
    isProviderAllowed,
    tab,
  } = useAddFunds();

  const [value, setValue] = useState<string | null>(parseFloat(fiatQuantity || '25.00').toFixed(2));

  const narrowedNetworks = useMemo(() => {
    return !asset
      ? networks
      : getOnRampNetworks(onRampConfig.assetInfo, {
          walletType: activeWallet?.type,
          allowed: onRampConfig.allowedAssets
            ? Object.entries(onRampConfig.allowedAssets)
                .filter(([_, value]) => value === true || value.includes(asset))
                .map(([key]) => key as TNetwork)
            : undefined,
          assets: [asset],
          providers: onRampConfig.providers,
          action: tab === EnabledFlow.BUY ? OnRampPurchaseType.BUY : OnRampPurchaseType.SELL,
        });
  }, [networks, network, asset, activeWallet?.type, onRampConfig.providers, tab]);

  const content = useMemo(() => {
    if ((!!asset && Object.values(isProviderAllowed).every(v => !v)) || assets.length === 0) {
      return (
        <Container key="noProviders" {...contentMotionProps} isPresent={isPresent}>
          <NoProviders isHidden={Object.values(isProviderAllowed).some(v => !!v)} variant="bodyM">
            No providers are available for this {hideWallets ? 'account' : 'wallet'}
          </NoProviders>
        </Container>
      );
    }

    return !!asset ? (
      <Container key="quantity" {...contentMotionProps} isPresent={isPresent}>
        {assets.length > 0 && (
          <>
            <CpslRow>
              <HeaderSelectContainer>
                {assets.length > 1 ? (
                  <HeaderSelect
                    selectedValue={asset}
                    onCpslSelectValueChange={e => {
                      setAsset(e.detail as TOnRampAsset);
                    }}
                    showFormattedSelectedItem
                    placeholder="Choose asset..."
                    anchorElId="inputContainer"
                    // dropdownMaxHeight={dropdownMaxHeight}
                    $width={160}
                    // // Adding 16 for the top padding + 1 for the border
                    // $top={mobileAnchor + 16 + 1}
                    autoWidth
                    selectedItemVariant="bodyXS"
                  >
                    {asset && <AssetPill asset={asset} slot="selected-item" />}
                    {assets.map(a => (
                      <HeaderSelectItem key={a} slot="items" value={a}>
                        <AssetPill gap="8px" asset={a} />
                      </HeaderSelectItem>
                    ))}
                  </HeaderSelect>
                ) : (
                  <AssetPill asset={asset} fix />
                )}
              </HeaderSelectContainer>
              <HeaderSelectContainer>
                {narrowedNetworks.length > 1 ? (
                  <HeaderSelect
                    selectedValue={network}
                    onCpslSelectValueChange={e => {
                      setNetwork(e.detail as TNetwork);
                    }}
                    showFormattedSelectedItem
                    placeholder="Choose network..."
                    // dropdownMaxHeight={dropdownMaxHeight}
                    $width={160}
                    // // Adding 16 for the top padding + 1 for the border
                    // $top={mobileAnchor + 16 + 1}
                    autoWidth
                    selectedItemVariant="bodyXS"
                  >
                    {network && <NetworkPill network={network} start={NetworkLabel} slot="selected-item" />}
                    {narrowedNetworks.map(n => (
                      <HeaderSelectItem key={n} slot="items" value={n}>
                        <NetworkPill gap="8px" network={n} />
                      </HeaderSelectItem>
                    ))}
                  </HeaderSelect>
                ) : network ? (
                  <NetworkPill network={network} start={NetworkLabel} fix />
                ) : null}
              </HeaderSelectContainer>
            </CpslRow>
            <CpslRow col gap="16px">
              <QuantityInput value={value} onChange={setValue} symbol="$" />
              <CpslRow style={{ width: '100%' }}>
                {['25', '50', '100'].map(quantity => {
                  return (
                    <PresetButton fullWidth key={quantity} variant="secondary" onClick={() => setValue(`${quantity}.00`)}>
                      ${quantity}
                    </PresetButton>
                  );
                })}
              </CpslRow>
            </CpslRow>
            <CpslButton
              fullWidth
              disabled={value === ''}
              onClick={() => {
                setFiatQuantity(value ?? undefined);
                setOnRampStep(OnRampStep.PROVIDER);
              }}
            >
              Continue
              <CpslIcon icon="arrow" />
            </CpslButton>
          </>
        )}
      </Container>
    ) : (
      <AssetContainer key="asset" {...contentMotionProps} isPresent={isPresent}>
        <AddFundsAsset />
      </AssetContainer>
    );
  }, [asset, network, assets, narrowedNetworks, isProviderAllowed, isPresent, value]);

  useEffect(() => {
    if (!network || !narrowedNetworks.includes(network)) {
      setNetwork(narrowedNetworks[0] as TNetwork);
    }
  }, [narrowedNetworks, network, tab]);

  useEffect(() => {
    if (!!asset && !assets.includes(asset)) {
      setAsset(assets[0]);
    }
  }, [assets, asset, tab]);

  return <AnimatePresence mode="wait">{content}</AnimatePresence>;
}

const Container = safeStyled(motion.div)<{ isPresent?: boolean }>`
  width: 100%;
  height: 100%;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  position: relative;
  height: 320px;
  ${({ isPresent }) => (isPresent ? 'transform: none !important;' : '')};

  & > * {
    width: 100%;
  }
`;

const AssetContainer = safeStyled(Container)`
  gap: 8px;
`;

const PresetButton = safeStyled(CpslButton)`
  --button-color: var(--cpsl-color-text-contrast);
  --button-font-size: 24px;
  --button-secondary-background-color: var(--cpsl-color-background-8);
  --button-secondary-border-color: var(--cpsl-color-background-8);
  --button-secondary-hover-color: var(--cpsl-color-text-contrast);
  --button-secondary-hover-background-color: var(--cpsl-color-background-16);
  --button-secondary-hover-border-color: var(--cpsl-color-background-16);
  flex: 1;
`;
