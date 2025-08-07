import { AccountTypeIcon, GradientScroll, StepContainer, WalletTypeIcon } from '../common.js';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { useAccount, useClient } from '../../../provider/index.js';
import { useLinkedAccounts } from '../../../provider/hooks/index.js';
import { getWalletDisplayName } from '../../utils/getWalletDisplayName.js';
import { LinkedAccount as TLinkedAccount, TLinkedAccountType, truncateAddress } from '@getpara/web-sdk';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { ReactNode } from 'react';
import { safeStyled, useCopyToClipboard } from '@getpara/react-common';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { ACCOUNT_TYPES } from '../../constants/oAuthLogos.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { AccountHeader } from './AccountHeader.js';

const Entry = ({
  identifier,
  icon,
  name,
  address,
  addressShort,
  onUnlink,
}: {
  identifier?: string;
  icon: ReactNode;
  name: string;
  address?: string;
  addressShort?: string;
  onUnlink?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}) => {
  const [isCopied, copy] = useCopyToClipboard();

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
  const para = useClient();
  const { connectionType, embedded } = useAccount();
  const { data: linkedAccounts } = useLinkedAccounts();
  const { wallets } = useExternalWallets();
  const { isEnabled, linkAccount, unlinkAccount } = useAccountLinking();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);

  if (!para) {
    return null;
  }

  const externalWallet = para.authInfo?.externalWallet;

  return (
    <StepContainer>
      <AccountHeader />
      <ParaConnect target="_blank" href="https://connect.getpara.com" rel="noreferrer noopener">
        <ParaIcon icon="paraIconBrand" size="40px" inset="8px" background="white" />
        <div>
          Do even more with your wallet
          <br />
          at <span style={{ fontWeight: '600' }}>Para Connect</span>
        </div>
        <Dots>
          {new Array(6).fill(0).map((_, index) => (
            <DotsIcon key={index} index={index} icon="dotsSquare" size="27.5px" />
          ))}
          <ParaArrow icon="paraArrow" size="31px" color="white" />
        </Dots>
      </ParaConnect>
      <Section>
        <Title variant="bodyS" color="secondary">
          Connected Wallets
        </Title>
        <Content>
          {externalWallet && connectionType === 'external' ? (
            <Entry
              key={externalWallet.address}
              icon={
                <WalletTypeIcon
                  walletType={externalWallet.type!}
                  externalWallet={externalWallet.providerId}
                  size="24px"
                  inset="0"
                />
              }
              name={externalWallet.ensName ?? externalWallet.provider ?? ''}
              address={externalWallet.addressBech32 ?? externalWallet.address}
              addressShort={truncateAddress(externalWallet.addressBech32 ?? externalWallet.address, externalWallet.type, {
                prefix: para.cosmosPrefix,
              })}
            />
          ) : (
            para?.availableWallets?.map(wallet => (
              <Entry
                key={wallet.address}
                icon={<WalletTypeIcon walletType={wallet.type!} externalWallet={wallet.externalProviderId} size="24px" />}
                name={getWalletDisplayName(para, wallet)}
                address={wallet.address}
                addressShort={truncateAddress(wallet.address!, wallet.type!)}
              />
            ))
          )}
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

                  const externalWalletConnector = wallets.find(wallet => wallet.id === externalWallet?.providerId);
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

const ParaConnect = safeStyled.a`
  position: relative;
  box-sizing: border-box;
  width: 100%;
  text-decoration: none;
  color: white !important;
  font-family: 'PP Mori', sans-serif;
  font-weight: 500;
  font-size: 15px;
  padding: 16px;
  height: 69px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #FF4E00;
  background: #FF4E00;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.05), 0 0 20px 8px rgba(251, 188, 4, 0.20) inset;

  &:hover, &:active {
    background: #FF6A2B;
    border: 1px solid #FF6A2B;
  }

`;

const ParaIcon = safeStyled(CpslIcon)`
  --border-radius: 4px;
`;

const Dots = safeStyled.div`
  width: 75px;
  position: absolute;
  right: 14px;
  top: 7px;
`;

const DotsIcon = safeStyled(CpslIcon)<{ index: number }>`
  position: absolute;
  left: ${({ index }) => `${(index % 3) * 27.5}px`};
  top: ${({ index }) => `${Math.floor(index / 3) * 27.5}px`};
`;

const ParaArrow = safeStyled(CpslIcon)`
  position: absolute;
  top: 12px;
  right: 4px;
`;
