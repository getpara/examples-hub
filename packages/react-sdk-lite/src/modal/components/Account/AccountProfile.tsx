import { AccountTypeIcon, GradientScroll, StepContainer, WalletTypeIcon } from '../common.js';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { useAccount } from '../../../provider/index.js';
import { useLinkedAccounts } from '../../../provider/hooks/index.js';
import { getWalletDisplayName } from '../../utils/getWalletDisplayName.js';
import {
  formatAssetQuantity,
  formatCurrency,
  LinkedAccount as TLinkedAccount,
  TLinkedAccountType,
  truncateAddress,
  WalletBalance,
} from '@getpara/web-sdk';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { ReactNode, useMemo } from 'react';
import { ACCOUNT_TYPES, safeStyled, useCopyToClipboard } from '@getpara/react-common';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAssets } from '../../../provider/providers/AssetsProvider.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

const Entry = ({
  identifier,
  icon,
  name,
  address,
  addressShort,
  balance: walletBalance,
  onUnlink,
}: {
  identifier?: string;
  icon: ReactNode;
  name: string;
  address?: string;
  addressShort?: string;
  balance?: WalletBalance;
  onUnlink?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}) => {
  const balancesConfig = useStore(state => state.modalConfig?.balances);
  const [isCopied, copy] = useCopyToClipboard();

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
    <EntryContainer key={address ?? identifier}>
      {icon}
      <EntryDisplayName variant="bodyM" color="contrast">
        {name}
      </EntryDisplayName>
      <EntryFlex>
        {address ? (
          <EntryAddress>
            <CpslText variant="bodyM" color="secondary">
              {addressShort ?? address}
            </CpslText>
            <CpslButton
              size="small"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                copy(address);
              }}
            >
              <CopyIcon id="ignore-click" slot="start" isCopied={isCopied} icon={isCopied ? 'check' : 'copy'} />
            </CpslButton>
          </EntryAddress>
        ) : null}
      </EntryFlex>
      {typeof balance === 'string' && balance !== '' && (
        <CpslText variant="bodyM" color="contrast">
          {balance}
        </CpslText>
      )}
      {onUnlink && (
        <EntryUnlink href="#" onClick={onUnlink}>
          Unlink
        </EntryUnlink>
      )}
    </EntryContainer>
  );
};

export const AccountProfile = ({
  isDisconnecting,
  onDisconnect,
}: {
  isDisconnecting: boolean;
  onDisconnect: () => void;
}) => {
  const para = useInternalClient();
  const { embedded } = useAccount();
  const { data: linkedAccounts } = useLinkedAccounts();
  const { wallets } = useExternalWallets();
  const { isEnabled, linkAccount, unlinkAccount } = useAccountLinking();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const { profileBalance } = useAssets();
  const setStep = useModalStore(state => state.setStep);

  if (!para) {
    return null;
  }

  const embeddedWallets = para?.availableWallets?.filter(wallet => !wallet.isExternal);

  return (
    <StepContainer>
      {/* Embedded Wallets Section - only show if there are embedded wallets */}
      {embeddedWallets.length > 0 && (
        <Section>
          <Title variant="bodyS" color="secondary">
            {para.partnerName} Wallets
          </Title>
          <Content>
            {embeddedWallets.map(wallet => (
              <Entry
                key={wallet.address}
                icon={<WalletTypeIcon walletType={wallet.type!} externalWallet={wallet.externalProviderId} size="24px" />}
                name={getWalletDisplayName(para, wallet)}
                address={wallet.address}
                addressShort={truncateAddress(wallet.address!, wallet.type!)}
                balance={profileBalance?.wallets.find(w => w.address === wallet.address)}
              />
            ))}
          </Content>
        </Section>
      )}

      {/* External Wallets Section */}
      <Section>
        <Title variant="bodyS" color="secondary">
          External Wallets
        </Title>
        <Content>
          {Object.values(para?.externalWallets || {}).map(wallet => {
            const externalWallet = wallets.find(w => w.name === wallet.name);

            return (
              <Entry
                key={wallet.address}
                icon={
                  <WalletTypeIcon
                    walletType={wallet.type!}
                    externalWallet={externalWallet ?? wallet.externalProviderId}
                    size="24px"
                    inset="0"
                  />
                }
                name={wallet.ensName ?? wallet.name ?? ''}
                address={wallet.address}
                addressShort={
                  wallet.address
                    ? truncateAddress(wallet.address, wallet.type!, {
                        prefix: para.cosmosPrefix,
                      })
                    : ''
                }
                balance={profileBalance?.wallets.find(w => w.address === wallet.address)}
              />
            );
          })}
          <CpslButton
            fullWidth
            variant="tertiary"
            onClick={() => {
              setStep(ModalStep.ADD_EX_WALLET_MORE);
            }}
          >
            <CpslIcon icon="plus" slot="start" />
            Add Wallet
          </CpslButton>
        </Content>
      </Section>

      {isEnabled && (
        <Section>
          <Title variant="bodyS" color="secondary">
            Linked Accounts
          </Title>
          <Content>
            <GradientScroll gap="12px" height="360px">
              {[...(linkedAccounts?.primary || []).map(p => ({ ...p, isPrimary: true })), ...(linkedAccounts?.linked || [])]
                .filter(({ externalWallet }) => {
                  return !externalWallet || externalWallet.address !== embedded?.externalWalletAddress;
                })
                .map((linkedAccount: TLinkedAccount & { isPrimary?: boolean }) => {
                  const { identifier, displayName, type, isPrimary = false, externalWallet } = linkedAccount;

                  const externalWalletConnector = wallets.find(
                    wallet =>
                      wallet.id === externalWallet?.providerId ||
                      wallet.id.toLowerCase() === externalWallet?.providerId?.toLowerCase() ||
                      wallet.name.toLowerCase() === externalWallet?.providerId?.toLowerCase(),
                  );

                  let accountType: TLinkedAccountType | string | undefined = type;
                  let src: string | undefined = undefined;

                  if (externalWallet) {
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
                    <Entry
                      key={identifier}
                      icon={<AccountTypeIcon accountType={accountType} src={src} size="24px" />}
                      name={
                        externalWallet
                          ? (externalWallet.ensName ?? externalWalletConnector?.name ?? externalWallet.provider ?? '')
                          : (displayName ?? identifier)
                      }
                      address={externalWallet?.addressBech32 ?? externalWallet?.address}
                      addressShort={
                        externalWallet
                          ? truncateAddress(externalWallet.addressBech32 ?? externalWallet.address, externalWallet.type, {
                              prefix: para.cosmosPrefix,
                            })
                          : undefined
                      }
                      onUnlink={
                        isPrimary
                          ? undefined
                          : e => {
                              e.preventDefault();
                              unlinkAccount(linkedAccount);
                            }
                      }
                    />
                  );
                })}
            </GradientScroll>
            <CpslButton fullWidth variant="tertiary" onClick={() => linkAccount(undefined)}>
              <CpslIcon icon="userPlus" slot="start" />
              Link an account
            </CpslButton>
          </Content>
        </Section>
      )}
      <DisconnectButton variant="destructive" fullWidth onClick={onDisconnect} disabled={isDisconnecting}>
        {hideWallets ? 'Logout' : 'Disconnect Wallet'}
        <CpslIcon icon="logOut" slot="end" />
      </DisconnectButton>
    </StepContainer>
  );
};

const Section = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

const Content = safeStyled(Section)`
  gap: 12px;
`;

const Title = safeStyled(CpslText)`
  font-weight: 600;
`;

const EntryContainer = safeStyled.div`
  overflow: hidden;
  position: relative;
  width: 100%;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const EntryDisplayName = safeStyled(CpslText)``;

const EntryFlex = safeStyled.div`
  flex: 1;
`;

const EntryAddress = safeStyled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

const DisconnectButton = safeStyled(CpslButton)`
  --button-border-width: 0px;
  --button-destructive-hover-background-color: rgba(255, 0, 0, 0.2);
  --button-destructive-active-background-color: rgba(255, 0, 0, 0.1);

`;
