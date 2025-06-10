import { CpslButton, CpslIcon, CpslIdenticon, CpslText } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import ParaWeb, { truncateAddress, TWalletType } from '@getpara/web-sdk';
import { useEffect, useRef } from 'react';
import { useDropdownPosition } from '../AuthInput/hooks/useDropdownPosition.js';
import { useAccount, useWallet, useWalletState } from '../../../provider/index.js';
import { HeaderSelect, HeaderSelectContainer, HeaderSelectItem } from '../common.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useCopyToClipboard } from '@getpara/react-common';

const getValue = (id?: string, type?: TWalletType) => {
  return id && type ? `${id}~${type}` : undefined;
};

const WALLET_TYPES = {
  EVM: 'EVM',
  SOLANA: 'Solana',
  COSMOS: 'Cosmos',
};

export const ChainSelect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);
  const { data: activeWallet } = useWallet();

  const { switchChain, chainId, chains, chainIdSwitchingTo } = useExternalWallets();

  useEffect(() => {
    if (dropdownMaxHeight && chainId) {
      resize();
    }
  }, [chainId, chainIdSwitchingTo, dropdownMaxHeight]);

  const handleChainChange = async (chainId: string) => {
    await switchChain(chainId);
  };

  if (!activeWallet || !activeWallet.isExternal || activeWallet.type === 'SOLANA') {
    return null;
  }

  const chainIdToUse = chainIdSwitchingTo ?? chainId;
  const selectedChainName = chains.find(c => c.id.toString() === chainIdToUse)?.name;

  return (
    <Container>
      <HeaderSelectContainer ref={containerRef} id="inputContainer">
        <HeaderSelect
          selectedValue={chainIdToUse?.toString() ?? ''}
          onCpslSelectValueChange={e => {
            handleChainChange(e.detail);
          }}
          showFormattedSelectedItem
          placeholder="Choose chain..."
          anchorElId="inputContainer"
          dropdownMaxHeight={dropdownMaxHeight}
          $width={dropdownWidth ?? 0}
          // Adding 16 for the top padding + 1 for the border
          $top={(mobileAnchor ?? 0) + 16 + 1}
          autoWidth
          selectedItemVariant="bodyXS"
        >
          {chainIdToUse && (
            <ChainName variant="bodyXS" color="contrast" slot="selected-item">
              {selectedChainName}
            </ChainName>
          )}
          {chains?.map(chain => (
            <HeaderSelectItem key={chain.id} slot="items" value={chain.id.toString()}>
              <ChainName variant="bodyXS" color="contrast">
                {chain.name}
              </ChainName>
            </HeaderSelectItem>
          ))}
        </HeaderSelect>
      </HeaderSelectContainer>
    </Container>
  );
};

function getName(
  para: ParaWeb,
  {
    type,
    isExternal,
    name,
    isMenu = false,
    hideWallets = false,
  }: Partial<
    Pick<(typeof para.availableWallets)[0], 'type' | 'isExternal' | 'name'> & {
      isMenu?: boolean;
      hideWallets?: boolean;
    }
  >,
) {
  if (para.isMultiWallet) {
    return (
      name ??
      `${isExternal ? 'External ' : ''}${type ? WALLET_TYPES[type] : ''}${!hideWallets && (isMenu || isExternal) ? ' Wallet' : ''}`
    );
  }

  return hideWallets ? 'My Account' : name || 'My Wallet';
}

export const AccountSelect = () => {
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const para = useInternalClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);
  const [isCopied, copy] = useCopyToClipboard();

  const { setSelectedWallet } = useWalletState();
  const { data: activeWallet } = useWallet();
  const { data: account } = useAccount();

  const availableWallets = account?.wallets;

  const isGuest = para.isGuestMode && activeWallet?.pregenIdentifierType === 'GUEST_ID';

  const handleCopy = () => {
    copy(activeWallet?.address ? para.getDisplayAddress(activeWallet.id, { addressType: activeWallet.type }) : '');
  };

  const ActiveWalletNode = activeWallet ? (
    <FlexRow slot="selected-item" style={{ height: '24px' }}>
      {!isGuest && (
        <CpslIdenticon variant="avatar" size="24px" hash={para.getIdenticonHash(activeWallet.id, activeWallet.type)} />
      )}
      <WalletName variant="bodyXS" color="contrast" style={{ marginLeft: isGuest ? '8px' : '0px' }}>
        {isGuest ? 'Guest' : getName(para, { ...activeWallet, hideWallets })}
      </WalletName>
      {!hideWallets && (
        <>
          <CpslText variant="bodyXS" color="secondary">
            {activeWallet.ensName ??
              para.getDisplayAddress(activeWallet.id, { truncate: true, addressType: activeWallet.type })}
          </CpslText>
          <CpslButton
            id="ignore-click"
            size="small"
            variant="ghost"
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              handleCopy();
            }}
          >
            <CpslIcon id="ignore-click" slot="start" icon={isCopied ? 'check' : 'copy'} />
          </CpslButton>
        </>
      )}
    </FlexRow>
  ) : null;

  useEffect(() => {
    if (dropdownMaxHeight && activeWallet?.address) {
      resize();
    }
  }, [activeWallet, availableWallets, dropdownMaxHeight]);

  return (
    <Container>
      <HeaderSelectContainer ref={containerRef} id="addressInputContainer">
        {availableWallets && availableWallets.length > 1 ? (
          <HeaderSelect
            selectedValue={getValue(activeWallet?.id, activeWallet?.type)}
            onCpslSelectValueChange={e => {
              const [id, type] = e.detail.split('~');
              setSelectedWallet({ id, type: type as TWalletType });
            }}
            showFormattedSelectedItem
            placeholder="Choose wallet..."
            anchorElId="addressInputContainer"
            dropdownMaxHeight={dropdownMaxHeight}
            $width={dropdownWidth ?? 0}
            // Adding 16 for the top padding + 1 for the border
            $top={(mobileAnchor ?? 0) + 16 + 1}
            autoWidth
            selectedItemVariant="bodyXS"
          >
            {activeWallet && ActiveWalletNode}
            {availableWallets.map(({ address, name: _name, id, type, isExternal }) => {
              const key = getValue(id, type);
              const name = _name ?? getName(para, { type, isExternal, isMenu: true, hideWallets });
              return (
                <HeaderSelectItem key={key} slot="items" value={key}>
                  <FlexRow>
                    <CpslIdenticon size="40px" hash={para.getIdenticonHash(id, type)} />
                    <FlexCol>
                      {name && (
                        <CpslText variant="bodyS" color="contrast">
                          {name}
                        </CpslText>
                      )}
                      {!hideWallets && address && type && (
                        <CpslText variant="bodyXS" color="secondary">
                          {truncateAddress(address, type, { prefix: para.cosmosPrefix })}
                        </CpslText>
                      )}
                    </FlexCol>
                  </FlexRow>
                </HeaderSelectItem>
              );
            })}
          </HeaderSelect>
        ) : (
          ActiveWalletNode
        )}
      </HeaderSelectContainer>
    </Container>
  );
};

const Container = safeStyled.div`
  flex: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const FlexRow = safeStyled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FlexCol = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const WalletName = safeStyled(CpslText)`
  white-space: nowrap;
`;

const ChainName = safeStyled(CpslText)`
  max-width: 150px;
  text-transform: capitalize;

  &::part(text-element) {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
