import { useEffect, useRef } from 'react';
import { useDropdownPosition, useCopyToClipboard } from '../hooks/index.js';
import { safeStyled } from '../utils/index.js';
import { CpslButton, CpslIcon, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import { AvailableWallet, TWalletType, TExternalWallet } from '@getpara/web-sdk';
import { WalletTypeIcon as WalletTypeIconBase } from './WalletTypeIcon.js';

type EntryProps = {
  name?: string;
  type?: TWalletType;
  externalWallet?: TExternalWallet | string;
  withCopy?: boolean;
  withIcon?: boolean;
  copyValue?: string;
};

const Entry = ({
  isDark = false,
  withCopy,
  slot,
  withIcon,
  name,
  type,
  externalWallet,
  copyValue,
  isMultiOption,
}: {
  isDark?: boolean;
  slot?: string;
  isMenu?: boolean;
  isMultiOption?: boolean;
} & EntryProps) => {
  const [isCopied, copy] = useCopyToClipboard();

  return (
    <WalletContainer slot={slot} style={{ flex: '1' }} isMultiOption={isMultiOption}>
      {withIcon && (
        <WalletTypeIcon isDark={isDark} externalWallet={externalWallet} walletType={type} size="32px" inset="6px" />
      )}
      <CpslText
        variant="bodyM"
        color="contrast"
        style={{ flex: '1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip' }}
      >
        {name}
      </CpslText>
      {withCopy && copyValue && (
        <CopyButton
          id="ignore-click"
          size="small"
          variant="ghost"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            copy(copyValue);
          }}
        >
          <CpslIcon id="ignore-click" slot="start" icon={isCopied ? 'check' : 'copy'} />
        </CopyButton>
      )}
    </WalletContainer>
  );
};

export const WalletSelect = ({
  isDark = false,
  style,
  className,
  value,
  onChange,
  options,
  getEntryProps,
  getSelectValue,
  helperText,
}: {
  isDark;
  style?: React.CSSProperties;
  className?: string;
  value: AvailableWallet;
  onChange: (_: AvailableWallet) => void;
  options: AvailableWallet[];
  getEntryProps: (wallet: AvailableWallet) => EntryProps;
  getSelectValue: (wallet: AvailableWallet) => `${string}~${TWalletType}`;
  helperText?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize } = useDropdownPosition(containerRef);

  const isMulti = options.length > 1;

  const ActiveEntry = value ? (
    <Entry isDark={isDark} withCopy slot="selected-item" {...getEntryProps(value)} isMultiOption={isMulti} />
  ) : null;

  useEffect(() => {
    if (dropdownMaxHeight && value?.address) {
      resize();
    }
  }, [value, options, dropdownMaxHeight]);

  return (
    <Container className={className} style={style}>
      {isMulti && helperText && (
        <CpslText variant="bodyM" color="secondary" weight="semiBold">
          {helperText}
        </CpslText>
      )}
      <SelectContainer ref={containerRef} id="addressInputContainer">
        <Select
          selectedValue={getSelectValue(value)}
          onCpslSelectValueChange={e => {
            const [id, type] = e.detail.split('~');
            onChange(options.find(o => o.id === id && o.type === type));
          }}
          showFormattedSelectedItem
          placeholder="Choose wallet..."
          anchorElId="addressInputContainer"
          dropdownMaxHeight={dropdownMaxHeight}
          $width={dropdownWidth ?? 0}
          // Adding 16 for the top padding + 1 for the border
          $top={(mobileAnchor ?? 0) + 16 + 1}
          selectedItemVariant="bodyXS"
          icon={isMulti ? 'chevronUp' : null}
          disabled={!isMulti}
          isMultiOption={isMulti}
        >
          {value && ActiveEntry}
          {(options || []).map(wallet => {
            const key = getSelectValue(wallet);
            return (
              <SelectItem key={key} slot="items" value={key}>
                <Entry isDark={isDark} {...getEntryProps(wallet)} />
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

const WalletContainer = safeStyled.div<{ isMultiOption?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding-inline-end: ${({ isMultiOption }) => (isMultiOption ? '40px' : '0px')};
`;

export const Select = safeStyled(CpslSelect)<{ $width: number; $top?: number }>`
  --icon-width: 32px;
  --icon-height: 32px;
  --container-border-color: var(--cpsl-color-background-16);
  --container-background-color-disabled: var(--container-background-color);
  width: 100%;
  position: relative;

  &::part(selected-text) {
    white-space: nowrap;
  }

  &::part(dropdown) {
    min-width: ${({ $width }) => `${$width - 2}px`};
  }

  &::part(icon) {
    --icon-color: var(--cpsl-color-text-primary);
    position: absolute;
    right: 12px;
  }
`;

export const SelectItem = safeStyled(CpslSelectItem)<{ isMultiOption?: boolean }>`
  --outer-container-padding-start: 0px;
  --outer-container-padding-end: 0px;
  --outer-container-padding-top: 0px;
  --outer-container-padding-bottom: 0px;
  --container-padding-start: 12px;
  --container-padding-end: ${({ isMultiOption }) => (isMultiOption ? '40px' : '12px')};
  --container-padding-top: 8px;
  --container-padding-bottom: 8px;
`;

export const SelectContainer = safeStyled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--cpsl-border-radius-tile-button);
  background-color: var(--cpsl-color-background-4);
`;

const WalletTypeIcon = safeStyled(WalletTypeIconBase)`
  --border: 1px solid var(--cpsl-color-background-8);
  --border-radius: 4px;
`;

const CopyButton = safeStyled(CpslButton)`
  cpsl-icon {
    --height: 24px;
    --width: 24px;
  }
`;
