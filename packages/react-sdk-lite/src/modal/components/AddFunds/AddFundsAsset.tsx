import * as comp from '@getpara/react-components';
import { formatCurrency, getOnRampNetworks, TOnRampAsset } from '@getpara/web-sdk';
import { safeStyled, getAssetCode, getAssetName, ON_RAMP_ASSETS } from '@getpara/react-common';
import { useModalStore } from '../../stores/index.js';
import { useState } from 'react';
import { useAddFunds } from './AddFundsContext.js';
import { useWallet } from '../../../provider/hooks/queries/useWallet.js';
import { AssetIcon, GradientScroll } from '../common.js';
import { AnimatePresence, motion } from 'framer-motion';
import { contentMotionProps } from './common.js';
import { useAssets } from '../../../provider/providers/AssetsProvider.js';

export function AddFundsAsset() {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const { assets, setAsset, network, setNetwork } = useAddFunds();
  const { data: activeWallet } = useWallet();
  const { assetMetadata } = useAssets();

  const [searchStr, setSearchStr] = useState('');

  const onSelect = async (_asset: TOnRampAsset) => {
    await setAsset(_asset);
    if (!network && !!onRampConfig && !!activeWallet) {
      await setNetwork(
        getOnRampNetworks(onRampConfig.assetInfo, {
          walletType: activeWallet.type,
          assets: [_asset],
        })[0],
      );
    }
  };

  return (
    <>
      <AnimatePresence mode="sync">
        {assets.length >= 4 && (
          <motion.div {...contentMotionProps}>
            <SearchInput
              placeholder="Search for an asset"
              value={searchStr}
              onCpslInput={e => {
                setSearchStr(e.detail.value);
              }}
            >
              <comp.CpslIcon icon="search" slot="start" />
            </SearchInput>
          </motion.div>
        )}
      </AnimatePresence>
      <GradientScroll height="calc(100% - 56px)" gap="8px">
        <AssetList>
          <AnimatePresence mode="sync">
            {assets
              .filter(asset => {
                return (
                  searchStr === '' ||
                  getAssetCode(asset).toLowerCase().startsWith(searchStr.toLowerCase()) ||
                  getAssetName(asset).toLowerCase().startsWith(searchStr.toLowerCase())
                );
              })
              .map(asset => (
                <motion.li
                  key={asset}
                  style={{ width: '100%' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AssetButton key={asset} fullWidth variant="secondary" onClick={() => onSelect(asset)}>
                    <AssetIcon asset={asset} size="48px" />
                    <Info>
                      <Code color="contrast" variant="bodyL">
                        {ON_RAMP_ASSETS[asset].code}
                      </Code>
                      <Name color="contrast" variant="bodyS">
                        {ON_RAMP_ASSETS[asset].name}
                      </Name>
                    </Info>
                    {assetMetadata?.[asset] && (
                      <comp.CpslText variant="bodyM">{formatCurrency(assetMetadata[asset].price)}</comp.CpslText>
                    )}
                  </AssetButton>
                </motion.li>
              ))}
          </AnimatePresence>
        </AssetList>
      </GradientScroll>
    </>
  );
}

const AssetList = safeStyled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  list-style: none;
  padding-inline-start: 0;
  margin: 0;
  padding: 0px;
`;

const AssetButton = safeStyled(comp.CpslButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  --button-secondary-background-color: var(--cpsl-color-background-8);
  --button-secondary-border-color: var(--cpsl-color-background-8);
  --button-secondary-hover-background-color: var(--cpsl-color-background-16);
  --button-secondary-hover-border-color: var(--cpsl-color-background-16);
`;

const Info = safeStyled(comp.CpslCol)`
    text-align: left;
  `,
  Code = comp.CpslText,
  Name = comp.CpslText;

const SearchInput = safeStyled(comp.CpslInput)`
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: transparent;
`;
