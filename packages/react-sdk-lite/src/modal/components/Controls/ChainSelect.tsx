import { CpslText } from '@getpara/react-components';
import { CommonChain, getNetworkFromChainId, getNetworkName, safeStyled } from '@getpara/react-common';
import { useEffect, useRef } from 'react';
import { useDropdownPosition } from '../AuthInput/hooks/useDropdownPosition.js';
import { useWallet } from '../../../provider/index.js';
import { HeaderSelect, HeaderSelectContainer, HeaderSelectItem, NetworkIcon } from '../common.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';

const Chain = ({
  chain: { id, name },
  slot,
  isLarge = false,
}: {
  chain: Pick<CommonChain, 'id'> & Partial<CommonChain>;
  slot?: string;
  isLarge?: boolean;
}) => {
  const network = getNetworkFromChainId(id.toString());
  const networkName = name ?? getNetworkName(id.toString()) ?? `Chain ID ${id.toString()}`;

  return (
    <div
      slot={slot}
      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: isLarge ? '0px' : '4px 0 4px 8px' }}
    >
      <NetworkIcon network={network} size={isLarge ? '24px' : '16px'} />
      <ChainName variant={isLarge ? 'bodyS' : 'bodyXS'} color="contrast">
        {networkName}
      </ChainName>
    </div>
  );
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
          alignCenter
          selectedItemVariant="bodyXS"
        >
          {chainIdToUse && (
            <Chain
              slot="selected-item"
              chain={{ id: chainIdToUse, name: chains.find(c => c.id.toString() === chainIdToUse)?.name }}
            />
          )}
          {chains?.map(chain => (
            <HeaderSelectItem key={chain.id} slot="items" value={chain.id.toString()}>
              <Chain isLarge chain={chain} />
            </HeaderSelectItem>
          ))}
        </HeaderSelect>
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

const ChainName = safeStyled(CpslText)`
  max-width: 150px;
  text-transform: capitalize;

  &::part(text-element) {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
