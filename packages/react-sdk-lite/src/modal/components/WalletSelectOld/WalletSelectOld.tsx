import { useEffect, useRef } from 'react';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useDropdownPosition } from '../AuthInput/hooks/useDropdownPosition.js';
import { MOBILE_SIZE, safeStyled, useCopyToClipboard, WalletTypeIcon as WalletTypeIconBase } from '@getpara/react-common';
import { useAccount, useWallet, useWalletState } from '../../../provider/index.js';
import { CpslButton, CpslIcon, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { TWalletType, Wallet as TWallet } from '@getpara/web-sdk';

const getValue = (id?: string, type?: TWalletType) => {
  return id && type ? `${id}~${type}` : undefined;
};

const Wallet = ({
  wallet,
  withCopy,
  slot,
  withIcon,
}: {
  wallet: Omit<TWallet, 'signer'>;
  withCopy?: boolean;
  slot?: string;
  withIcon?: boolean;
}) => {
  const para = useInternalClient();
  const [isCopied, copy] = useCopyToClipboard();

  return (
    <WalletContainer slot={slot} style={{ flex: '1' }}>
      {withIcon && (
        <WalletTypeIcon
          externalWallet={wallet.isExternal ? wallet.externalProviderId : undefined}
          walletType={wallet.type}
          size="32px"
          inset="6px"
        />
      )}
      <CpslText variant="bodyM" color="contrast" style={{ flex: '1' }}>
        {para.getDisplayAddress(wallet.id, { truncate: true, addressType: wallet.type })}
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

export const WalletSelectOld = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);

  const { setSelectedWallet } = useWalletState();
  const { data: activeWallet } = useWallet();
  const { embedded } = useAccount();

  const availableWallets = embedded?.wallets;
  const isMultiWallet = availableWallets && availableWallets.length > 1;

  const ActiveWalletNode = activeWallet ? <Wallet withCopy wallet={activeWallet} slot="selected-item" withIcon /> : null;

  useEffect(() => {
    if (dropdownMaxHeight && activeWallet?.address) {
      resize();
    }
  }, [activeWallet, availableWallets, dropdownMaxHeight]);

  return (
    <Container>
      {isMultiWallet && (
        <CpslText variant="bodyM" color="secondary" weight="semiBold">
          Select Wallet
        </CpslText>
      )}
      <SelectContainer ref={containerRef} id="addressInputContainerOld">
        <Select
          selectedValue={getValue(activeWallet?.id, activeWallet?.type)}
          onCpslSelectValueChange={e => {
            const [id, type] = e.detail.split('~');
            setSelectedWallet({ id, type: type as TWalletType });
          }}
          showFormattedSelectedItem
          placeholder="Choose wallet..."
          anchorElId="addressInputContainerOld"
          dropdownMaxHeight={dropdownMaxHeight}
          $width={dropdownWidth ?? 0}
          // Adding 220 for the top padding + 1 for the border
          $top={(mobileAnchor ?? 0) + 220 + 1}
          selectedItemVariant="bodyXS"
          icon={isMultiWallet ? 'chevronUp' : null}
          disabled={!isMultiWallet}
        >
          {activeWallet && ActiveWalletNode}
          {(availableWallets || []).map(wallet => {
            const key = getValue(wallet.id, wallet.type);
            return (
              <SelectItem key={key} slot="items" value={key}>
                <Wallet wallet={wallet} withIcon />
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
`;

export const Select = safeStyled(CpslSelect)<{ $width: number; $top?: number }>`
  --icon-width: 32px;
  --icon-height: 32px;
  --container-border-color: var(--cpsl-color-background-16);
  --container-background-color-disabled: var(--container-background-color);
  width: 286px;
  position: relative;

  &::part(selected-text) {
    white-space: nowrap;
  }

  &::part(dropdown) {
    min-width: ${({ $width }) => `${$width - 2}px`};
  } 

  &::part(popover) {
      /* Have to adjust the top of the popover here since we're using a transform on the modal which causes fixed position items to not be relative to the viewport */
      @media (max-width: ${MOBILE_SIZE}px) {
        top: ${({ $top }) => ($top ? `${$top}px` : '0px')};
        bottom: 16px;
      }
      cpsl-auth-modal.force-mobile-media & {
        top: ${({ $top }) => ($top ? `${$top}px` : '0px')};
        bottom: 16px;
      }
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
`;

export const SelectContainer = safeStyled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--cpsl-border-radius-tile-button);
  background-color: var(--cpsl-color-background-4);
`;

const WalletTypeIcon = safeStyled(WalletTypeIconBase)`
  --border: 1px solid var(--cpsl-color-background-8);
  --background: var(--cpsl-color-background-0);
  --border-radius: 4px;
`;

const CopyButton = safeStyled(CpslButton)`
  cpsl-icon {
    --height: 24px;
    --width: 24px;
  }
`;
