import { CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import styled from 'styled-components';
import { useCapsuleStore } from '../../stores/index.js';
import { ExternalWalletType } from '@usecapsule/web-sdk';
import { useEffect, useRef } from 'react';
import { useDropdownPosition } from '../AuthInput/hooks/useDropdownPosition.js';
import { MOBILE_SIZE } from '../../constants/constants.js';
import { formatWalletAddress } from '../../utils/stringFormatters.js';
import { useWallet } from '../../providers/WalletContext.js';

export const ChainSelect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);

  const capsule = useCapsuleStore(state => state.capsule);
  const { switchChain, chainId, chains, chainIdSwitchingTo } = useExternalWallets();

  useEffect(() => {
    if (dropdownMaxHeight && chainId) {
      resize();
    }
  }, [chainId, chainIdSwitchingTo, dropdownMaxHeight]);

  const walletType = capsule.externalWallets[capsule.currentExternalWalletAddresses?.[0] ?? '']?.type;

  const handleChainChange = async (chainId: string) => {
    await switchChain(chainId);
  };

  if (!walletType || walletType === ExternalWalletType.SOLANA) {
    return null;
  }

  const chainIdToUse = chainIdSwitchingTo ?? chainId;
  const selectedChainName = chains.find(c => c.id.toString() === chainIdToUse)?.name;

  return (
    <Container>
      <SelectContainer ref={containerRef} id="inputContainer">
        <StyledSelect
          selectedValue={chainIdToUse?.toString() ?? ''}
          onCpslSelectValueChange={e => {
            handleChainChange(e.detail);
          }}
          showFormattedSelectedItem
          placeholder="Choose chain..."
          anchorElId="inputContainer"
          dropdownMaxHeight={dropdownMaxHeight}
          $width={dropdownWidth}
          // Adding 16 for the top padding + 1 for the border
          $top={mobileAnchor + 16 + 1}
          autoWidth
        >
          {chainIdToUse && (
            <ChainName variant="bodyXS" color="contrast" slot="selected-item">
              {selectedChainName}
            </ChainName>
          )}
          {chains?.map(chain => (
            <StyledSelectItem key={chain.id} slot="items" value={chain.id.toString()}>
              <ChainName variant="bodyXS" color="contrast">
                {chain.name}
              </ChainName>
            </StyledSelectItem>
          ))}
        </StyledSelect>
      </SelectContainer>
    </Container>
  );
};

export const AccountSelect = () => {
  const capsule = useCapsuleStore(state => state.capsule);
  const { wallet, switchEmbeddedWallet } = useWallet();
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);

  const wallets = capsule.wallets ? Object.values(capsule.wallets) : [];

  useEffect(() => {
    if (dropdownMaxHeight && wallet?.address) {
      resize();
    }
  }, [wallet, wallets, dropdownMaxHeight]);

  const handleWalletChange = (walletId: string) => {
    switchEmbeddedWallet(walletId);
  };

  const SelectedWallet = wallet ? (
    <span slot="selected-item">
      {wallet.name && (
        <CpslText variant="bodyXS" color="contrast">
          {wallet.name}{' '}
        </CpslText>
      )}
      <CpslText variant="bodyXS" color={wallet.name ? 'secondary' : 'contrast'}>
        {formatWalletAddress(wallet.address)}
      </CpslText>
    </span>
  ) : null;

  return (
    <Container>
      <SelectContainer ref={containerRef} id="addressInputContainer">
        {wallets?.length > 1 ? (
          <StyledSelect
            selectedValue={wallet?.id ?? ''}
            onCpslSelectValueChange={e => {
              handleWalletChange(e.detail);
            }}
            showFormattedSelectedItem
            placeholder="Choose wallet..."
            anchorElId="addressInputContainer"
            dropdownMaxHeight={dropdownMaxHeight}
            $width={dropdownWidth}
            // Adding 16 for the top padding + 1 for the border
            $top={mobileAnchor + 16 + 1}
            autoWidth
          >
            {wallet && SelectedWallet}
            {wallets?.map(wallet => (
              <StyledSelectItem key={wallet.id} slot="items" value={wallet.id}>
                <span>
                  {wallet.name && (
                    <CpslText variant="bodyXS" color="contrast">
                      {wallet.name}{' '}
                    </CpslText>
                  )}
                  <CpslText variant="bodyXS" color={wallet.name ? 'secondary' : 'contrast'}>
                    {formatWalletAddress(wallet.address)}
                  </CpslText>
                </span>
              </StyledSelectItem>
            ))}
          </StyledSelect>
        ) : (
          SelectedWallet
        )}
      </SelectContainer>
    </Container>
  );
};

const Container = styled.div`
  flex: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const SelectContainer = styled.div`
  height: 24px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 1000px;
  background-color: var(--cpsl-color-background-8);
  padding: 8px;
`;

const ChainName = styled(CpslText)`
  text-transform: capitalize;
`;

const StyledSelect = styled(CpslSelect)<{ $width: number; $top?: number }>`
  --container-height: auto;
  --container-border-width: 0px;
  --container-padding-end: 0px;
  --container-padding-start: 0px;
  --container-background-color: transparent;
  --container-box-shadow: none;
  --container-gap: 2px;
  --icon-width: 16px;
  --icon-height: 16px;

  &::part(dropdown) {
    min-width: ${({ $width }) => `${$width - 2}px`};
  }

  &::part(popover) {
    /* Have to adjust the top of the popover here since we're using a transform on the modal which causes fixed position items to not be relative to the viewport */
    @media (max-width: ${MOBILE_SIZE}px) {
      top: ${({ $top }) => ($top ? `${$top}px` : '0px')};
      bottom: 16px;
    }
  }

  &::part(icon) {
    --icon-color: var(--cpsl-color-contrast);
  }
`;

const StyledSelectItem = styled(CpslSelectItem)`
  --outer-container-padding-start: 4px;
  --outer-container-padding-end: 4px;
  --outer-container-padding-top: 4px;
  --outer-container-padding-bottom: 4px;
`;
