import * as comp from '@getpara/react-components';
import { getOnRampNetworks, OnRampAsset } from '@getpara/web-sdk';
import styled from 'styled-components';
import { getAssetCode, getAssetName, ON_RAMP_ASSETS } from '../../constants/constants.js';
import { useModalStore } from '../../stores/index.js';
import { useRef, useState } from 'react';
import { useAddFunds } from './AddFundsContext.js';
import { useWallet } from '../../../provider/hooks/queries/useWallet.js';
import { AssetIcon } from '../common.js';
import { AnimatePresence, motion } from 'framer-motion';
import { contentMotionProps } from './common.js';

export function AddFundsAsset() {
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const { assets, setAsset, network, setNetwork } = useAddFunds();
  const { data: activeWallet } = useWallet();

  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [searchStr, setSearchStr] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const onSelect = async (_asset: OnRampAsset) => {
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

  const onScroll = () => {
    if (ref.current) {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
      }

      if (scrollTop < 30) {
        setIsAtTop(true);
      } else {
        setIsAtTop(false);
      }
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
      <ScrollContainer isAtBottom={isAtBottom} isAtTop={isAtTop} ref={ref} onScroll={onScroll}>
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
                      <Code variant="bodyL">{ON_RAMP_ASSETS[asset].code}</Code>
                      <Name variant="bodyS">{ON_RAMP_ASSETS[asset].name}</Name>
                    </Info>
                  </AssetButton>
                </motion.li>
              ))}
          </AnimatePresence>
        </AssetList>
      </ScrollContainer>
    </>
  );
}

const ScrollContainer = styled.div<{ isAtBottom; isAtTop }>`
  height: calc(100% - 56px);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  mask-image: ${({ isAtBottom, isAtTop }) =>
    !isAtBottom && !isAtTop
      ? 'linear-gradient(to bottom, transparent 0%, black 24px, black calc(100% - 24px), transparent 100%)'
      : !isAtBottom
        ? 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)'
        : !isAtTop
          ? 'linear-gradient(to top, black calc(100% - 24px), transparent 100%)'
          : 'none'};
`;

const AssetList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  list-style: none;
  padding-inline-start: 0;
  margin: 0;
  padding: 0px;
`;

const AssetButton = styled(comp.CpslButton)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  --button-secondary-background-color: var(--cpsl-color-background-8);
  --button-secondary-border-color: var(--cpsl-color-background-8);
  --button-secondary-hover-background-color: var(--cpsl-color-background-16);
  --button-secondary-hover-border-color: var(--cpsl-color-background-16);
`;

const Info = styled(comp.CpslCol)`
    text-align: left;
  `,
  Code = comp.CpslText,
  Name = comp.CpslText;

const SearchInput = styled(comp.CpslInput)`
  --container-background-color: var(--cpsl-color-background-8);
  --input-background-color: transparent;
`;
