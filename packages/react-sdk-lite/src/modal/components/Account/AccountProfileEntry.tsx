import { CSSProperties, ReactNode, useMemo } from 'react';
import { ACCOUNT_TYPES, safeStyled, useCopyToClipboard, WalletTypeIcon } from '@getpara/react-common';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import {
  AvailableWallet,
  formatAssetQuantity,
  formatCurrency,
  LinkedAccount,
  TLinkedAccountType,
  truncateAddress,
} from '@getpara/web-sdk';
import { useStore } from '../../../provider/stores/useStore.js';
import { useModalStore } from '../../stores/index.js';
import { useAssets } from '../../../provider/providers/AssetsProvider.js';
import { ModalStep } from '../../utils/steps.js';
import { AccountTypeIcon } from '../common.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

const AccountProfileEntry = ({
  icon,
  key,
  text,
  textSecondary,
  textTertiary,
  copyString,
  accessory,
  style,
  className,
  onSelect,
  dataTestId,
}: {
  icon: ReactNode;
  key: string;
  text: string;
  textSecondary?: string;
  textTertiary?: string;
  copyString?: string;
  accessory?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onSelect?: () => void;
  dataTestId?: string;
}) => {
  const [isCopied, copy] = useCopyToClipboard();

  const Copy = copyString ? (
    <CpslButton
      size="small"
      variant="ghost"
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        copy(copyString!);
      }}
    >
      <CopyIcon id="ignore-click" slot="start" isCopied={isCopied} icon={isCopied ? 'check' : 'copy'} />
    </CpslButton>
  ) : null;

  return (
    <EntryContainer key={key} onClick={onSelect} className={className} style={style} data-testid={dataTestId}>
      {icon}
      <EntryDisplayName variant="bodyM" color="contrast">
        {text}
      </EntryDisplayName>
      <EntryFlex>
        {textSecondary ? (
          <>
            <CpslText variant="bodyM" color="secondary">
              {textSecondary}
            </CpslText>
            {Copy}
          </>
        ) : (
          Copy
        )}
      </EntryFlex>
      {textTertiary && (
        <CpslText variant="bodyM" color="contrast">
          {textTertiary}
        </CpslText>
      )}
      {accessory}
      {onSelect && <CpslIcon color="var(--cpsl-color-foreground-32)" icon="chevronRight" size="16px" />}
    </EntryContainer>
  );
};

export const WalletEntry = ({
  wallet,
  isSelectable = false,
  style,
  className,
}: {
  wallet: AvailableWallet;
  isSelectable?: boolean;
  style?: CSSProperties;
  className?: string;
}) => {
  const { wallets } = useExternalWallets();
  const { profileBalance } = useAssets();
  const balancesConfig = useStore(state => state.modalConfig?.balances);
  const setProfileWallet = useModalStore(state => state.setProfileWallet);
  const setStep = useModalStore(state => state.setStep);
  const walletBalance = useMemo(() => {
    return profileBalance?.wallets.find(w => w.address === wallet.address);
  }, [profileBalance, wallet.address]);

  const externalWallet = useMemo(
    () => wallets.find(w => w.id === wallet.externalProviderId),
    [wallets, wallet.externalProviderId],
  );

  const withAddressShort = wallet.ensName || !!wallet.externalProviderId;

  const balance = useMemo(() => {
    switch (true) {
      case !balancesConfig:
      case balancesConfig?.displayType === 'AGGREGATED':
        return formatCurrency(walletBalance?.value);
      default:
        return formatAssetQuantity({
          quantity: walletBalance?.assets.find(
            ({ metadata }) => !!metadata && metadata.symbol === balancesConfig.asset.symbol,
          )?.quantity,
          symbol: balancesConfig.asset.symbol,
        });
    }
  }, [balancesConfig, walletBalance]);

  return (
    <AccountProfileEntry
      key={wallet.address!}
      icon={
        <WalletTypeIcon
          walletType={wallet.type!}
          externalWallet={externalWallet ?? wallet.externalProviderId}
          size="24px"
          inset="0"
        />
      }
      text={wallet.ensName ?? wallet.externalProviderId ?? wallet.addressShort!}
      textSecondary={withAddressShort ? wallet.addressShort : undefined}
      textTertiary={balance}
      copyString={wallet.address!}
      style={{ ...(style || {}), zIndex: 2 }}
      className={className}
      onSelect={
        isSelectable
          ? () => {
              setProfileWallet(wallet);
              setStep(ModalStep.ACCOUNT_WALLET);
            }
          : undefined
      }
      dataTestId={`wallet-entry-${wallet.type}-${wallet.address}`}
    />
  );
};

export const AccountLinkEntry = ({
  accountLink,
  isPrimary = false,
}: {
  accountLink: LinkedAccount;
  isPrimary?: boolean;
}) => {
  const para = useInternalClient();
  const { wallets } = useExternalWallets();
  const { unlinkAccount } = useAccountLinking();
  const { identifier, displayName, type, externalWallet } = accountLink;

  const externalWalletConnector = wallets.find(
    wallet =>
      wallet.id === externalWallet?.providerId ||
      wallet.id.toLowerCase() === externalWallet?.providerId?.toLowerCase() ||
      wallet.name.toLowerCase() === externalWallet?.providerId?.toLowerCase(),
  );

  let accountType: TLinkedAccountType | string | undefined = type;
  let src: string | undefined = undefined;
  let address: string | undefined = undefined;
  let addressShort: string | undefined = undefined;

  if (externalWallet) {
    address = (externalWallet.addressBech32 ?? externalWallet.address)!;
    addressShort = truncateAddress(address, externalWallet.type, {
      prefix: para.cosmosPrefix,
    });
    if (externalWalletConnector) {
      accountType = undefined;
      src = externalWalletConnector.iconUrl;
    } else if (externalWallet.providerId && ACCOUNT_TYPES[externalWallet.providerId]) {
      accountType = externalWallet.providerId;
      src = undefined;
    } else {
      accountType = 'EXTERNAL_WALLET';
      src = undefined;
    }
  }
  return (
    <AccountProfileEntry
      key={identifier}
      icon={<AccountTypeIcon accountType={accountType} src={src} size="24px" />}
      text={
        externalWallet
          ? (externalWallet.ensName ?? externalWalletConnector?.name ?? externalWallet.provider ?? '')
          : (displayName ?? identifier)
      }
      textSecondary={addressShort}
      copyString={address}
      accessory={
        isPrimary ? undefined : (
          <EntryUnlink
            href="#"
            onClick={
              isPrimary
                ? undefined
                : e => {
                    e.preventDefault();
                    unlinkAccount(accountLink);
                  }
            }
          >
            Unlink
          </EntryUnlink>
        )
      }
    />
  );
};

const EntryContainer = safeStyled.button<{ onClick }>`
  overflow: hidden;
  position: relative;
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  ${({ onClick }) => (onClick ? 'cursor: pointer;' : '')}
`;

const EntryDisplayName = safeStyled(CpslText)``;

const EntryFlex = safeStyled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
`;

const CopyIcon = safeStyled(CpslIcon)<{ isCopied?: boolean }>`
  --width: 16px;
  --height: 16px;
  --icon-color: ${({ isCopied }) => (isCopied ? 'var(--cpsl-color-utility-green) !important' : 'var(--cpsl-color-text-secondary)')};

  &:hover {
    --icon-color: var(--cpsl-color-text-contrast);
  }
`;

const EntryUnlink = safeStyled.a<{ isDark?: boolean }>`
  color: var(--cpsl-color-utility-red);
  position: absolute;
  right: 0;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  font-family: var(--cpsl-font-family);

  &:hover {
    text-decoration: underline;
  }
`;
