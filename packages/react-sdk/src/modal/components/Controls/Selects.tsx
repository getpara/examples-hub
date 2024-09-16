import { CpslIdenticon, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import styled from 'styled-components';
import { useCapsuleStore, useModalStore } from '../../stores/index.js';
import CapsuleWeb, { truncateAddress, WalletType } from '@usecapsule/web-sdk';
import { useEffect, useRef } from 'react';
import { useDropdownPosition } from '../AuthInput/hooks/useDropdownPosition.js';
import { MOBILE_SIZE } from '../../constants/constants.js';
import { useActiveWallet } from '../../hooks/useActiveWallet.js';

const getValue = (id: string, type: WalletType) => {
  return id && type ? `${id}~${type}` : undefined;
};

const WALLET_TYPES = {
  [WalletType.EVM]: 'EVM',
  [WalletType.SOLANA]: 'Solana',
  [WalletType.COSMOS]: 'Cosmos',
};

export const ChainSelect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);
  const activeWallet = useActiveWallet();

  const { switchChain, chainId, chains, chainIdSwitchingTo } = useExternalWallets();

  useEffect(() => {
    if (dropdownMaxHeight && chainId) {
      resize();
    }
  }, [chainId, chainIdSwitchingTo, dropdownMaxHeight]);

  const handleChainChange = async (chainId: string) => {
    await switchChain(chainId);
  };

  if (!activeWallet || !activeWallet.isExternal || activeWallet.type === WalletType.SOLANA) {
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

function getName(
  capsule: CapsuleWeb,
  { type, isExternal, name }: Pick<(typeof capsule.availableWallets)[0], 'type' | 'isExternal' | 'name'>,
  isMenu = false,
) {
  if (capsule.isMultiWallet) {
    return name ?? `${isExternal ? 'External ' : ''}${WALLET_TYPES[type]}${isMenu || isExternal ? ' Wallet' : ''}`;
  }

  return name ?? 'My Wallet';
}

export const AccountSelect = () => {
  const capsule = useCapsuleStore(state => state.capsule);
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);

  const setActiveWallet = useModalStore(state => state.setActiveWallet);
  const activeWallet = useActiveWallet();

  const ActiveWalletNode = activeWallet ? (
    <FlexRow slot="selected-item">
      <CpslIdenticon variant="avatar" size="20px" hash={capsule.getIdenticonHash(activeWallet.id, activeWallet.type)} />
      <WalletName variant="bodyXS" color="contrast">
        {getName(capsule, activeWallet)}
      </WalletName>
      <CpslText variant="bodyXS" color="secondary">
        {capsule.getDisplayAddress(activeWallet.id, { truncate: true, addressType: activeWallet.type })}
      </CpslText>
    </FlexRow>
  ) : null;

  useEffect(() => {
    if (dropdownMaxHeight && activeWallet?.address) {
      resize();
    }
  }, [activeWallet, capsule.availableWallets, dropdownMaxHeight]);

  return (
    <Container>
      <SelectContainer ref={containerRef} id="addressInputContainer">
        {capsule.availableWallets.length > 1 ? (
          <StyledSelect
            selectedValue={getValue(activeWallet?.id, activeWallet?.type)}
            onCpslSelectValueChange={e => {
              const [id, type] = e.detail.split('~');
              setActiveWallet([id, type as WalletType]);
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
            {activeWallet && ActiveWalletNode}
            {capsule.availableWallets.map(({ address, name: _name, id, type, isExternal }) => {
              const key = getValue(id, type);
              const name = _name ?? getName(capsule, { type, isExternal }, true);
              return (
                <StyledSelectItem key={key} slot="items" value={key}>
                  <FlexRow>
                    <CpslIdenticon size="40px" hash={capsule.getIdenticonHash(id, type)} />
                    <FlexCol>
                      {name && (
                        <CpslText variant="bodyS" color="contrast">
                          {name}
                        </CpslText>
                      )}
                      <CpslText variant="bodyXS" color="secondary">
                        {truncateAddress(address, type, { prefix: capsule.cosmosPrefix })}
                      </CpslText>
                    </FlexCol>
                  </FlexRow>
                </StyledSelectItem>
              );
            })}
          </StyledSelect>
        ) : (
          ActiveWalletNode
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

const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FlexCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const WalletName = styled(CpslText)`
  white-space: nowrap;
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
