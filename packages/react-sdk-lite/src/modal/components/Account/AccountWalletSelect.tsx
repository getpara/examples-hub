import { useEffect, useMemo, useRef } from 'react';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useDropdownPosition } from '../AuthInput/hooks/useDropdownPosition.js';
import { getExternalWalletIcon, safeStyled, useCopyToClipboard } from '@getpara/react-common';
import { useAccount, useWallet, useWalletState } from '../../../provider/index.js';
import { CpslButton, CpslIcon, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { TWalletType, Wallet as TWallet, truncateAddress } from '@getpara/web-sdk';

const getValue = (id?: string, type?: TWalletType) => {
  return id && type ? `${id}~${type}` : undefined;
};

// TODO: remove the old wallet select component
const Wallet = ({
  wallet,
  withCopy,
  slot,
  withIcon,
  isMenu,
}: {
  wallet: Omit<TWallet, 'signer'>;
  withCopy?: boolean;
  slot?: string;
  withIcon?: boolean;
  isMenu?: boolean;
}) => {
  const para = useInternalClient();
  const [isCopied, copy] = useCopyToClipboard();

  const { name, icon, src } = useMemo(() => {
    let name, icon, src;

    if (wallet.isExternal) {
      name = wallet.ensName ?? truncateAddress(wallet.address!, wallet.type!, { prefix: para.cosmosPrefix });
      src = wallet.ensAvatar;
      icon = getExternalWalletIcon(wallet.externalProviderId);
    } else {
      name = `${para.partnerName} Wallet`;
      src = para.partnerLogo;
      icon = 'wallet02';
    }
    return { name, icon, src };
  }, [wallet, para.partnerName, para.partnerLogo, para.externalWallets]);

  return (
    <WalletContainer slot={slot} style={isMenu ? undefined : { flex: '0' }}>
      {withIcon && <WalletIcon icon={icon} src={src} size="32px" inset="6px" />}
      <CpslText
        variant={slot === 'selected-item' ? 'headingXS' : 'bodyM'}
        weight="semiBold"
        color="contrast"
        style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', flex: isMenu ? '1' : undefined }}
      >
        {name}
      </CpslText>
      {withCopy && (
        <CopyButton
          id="ignore-click"
          size="small"
          variant="ghost"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            copy(para.getDisplayAddress(wallet.id, { addressType: wallet.type! }));
          }}
        >
          <CpslIcon id="ignore-click" slot="start" icon={isCopied ? 'check' : 'copy'} />
        </CopyButton>
      )}
    </WalletContainer>
  );
};

export const AccountWalletSelect = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);

  const { setSelectedWallet } = useWalletState();
  const { data: activeWallet } = useWallet();
  const { embedded } = useAccount();

  // Only need the first embedded wallet here since that effectively represents the "profile"
  const firstEmbeddedWallet = embedded?.wallets?.filter(wallet => !wallet.isExternal)?.[0];
  const availableExternalWallets = embedded?.wallets?.filter(wallet => wallet.isExternal) || [];
  const availableWallets = [...(firstEmbeddedWallet ? [firstEmbeddedWallet] : []), ...availableExternalWallets];
  const isMultiWallet = availableWallets && availableWallets.length > 1;

  const ActiveWalletNode = activeWallet ? (
    <Wallet wallet={activeWallet} slot="selected-item" withCopy={activeWallet.isExternal} />
  ) : null;

  useEffect(() => {
    if (dropdownMaxHeight && activeWallet?.address) {
      resize();
    }
  }, [activeWallet, availableWallets, dropdownMaxHeight]);

  return (
    <Container>
      <SelectContainer ref={containerRef} id="addressInputContainer">
        <Select
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
          selectedItemVariant="bodyXS"
          icon={isMultiWallet ? 'chevronUp' : null}
          disabled={!isMultiWallet}
        >
          {activeWallet && ActiveWalletNode}
          {firstEmbeddedWallet && (
            <SelectItem key="embedded" slot="items" value={getValue(firstEmbeddedWallet?.id, firstEmbeddedWallet?.type)}>
              <Wallet isMenu wallet={firstEmbeddedWallet} withIcon />
            </SelectItem>
          )}
          {(availableExternalWallets || []).map(wallet => {
            const key = getValue(wallet.id, wallet.type);
            return (
              <SelectItem key={key} slot="items" value={key}>
                <Wallet isMenu wallet={wallet} withIcon withCopy />
              </SelectItem>
            );
          })}
        </Select>
      </SelectContainer>
    </Container>
  );
};

const Container = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const WalletContainer = safeStyled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const Select = safeStyled(CpslSelect)<{ $width: number; $top?: number }>`
  --icon-width: 32px;
  --icon-height: 32px;
  --container-border-color: transparent;
  --container-background-color: transparent;
  --container-border-width: 0px;
  --container-background-color-disabled: var(--container-background-color);
  --container-box-shadow: none !important;
  --dropdown-border-width: 0px;
  --dropdown-background-color: var(--cpsl-color-background-4);
  
  width: 286px;
  position: relative;

  &::part(selected-text) {
    white-space: nowrap;
  }

  &::part(select-container) {
    justify-content: center;
  }

  &::part(dropdown) {
    min-width: ${({ $width }) => `${$width - 2}px`};
  }

  &::part(icon) {
    --icon-color: var(--cpsl-color-text-primary);
  }
`;

export const SelectItem = safeStyled(CpslSelectItem)`
  --outer-container-padding-start: 0px;
  --outer-container-padding-end: 0px;
  --outer-container-padding-top: 0px;
  --outer-container-padding-bottom: 0px;
  --container-padding-start: 12px;
  --container-padding-end: 12px;
  --container-padding-top: 8px;
  --container-padding-bottom: 8px;
  --container-background-color: var(--cpsl-color-background-4);
  --container-hover-background-color: var(--cpsl-color-background-8);
  width: 100%;
`;

export const SelectContainer = safeStyled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--cpsl-border-radius-tile-button);
  background-color: transparent;
`;

const WalletIcon = safeStyled(CpslIcon)`
  --icon-border: 1px solid var(--cpsl-color-background-8);
  --icon-background: var(--cpsl-color-background-0);
  --icon-border-radius: 4px;
`;

const CopyButton = safeStyled(CpslButton)`
  cpsl-icon {
    --height: 24px;
    --width: 24px;
  }
`;
