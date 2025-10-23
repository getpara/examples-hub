import { GradientScroll, StepContainer } from '../common.js';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { useAccount } from '../../../provider/index.js';
import { useLinkedAccounts } from '../../../provider/hooks/index.js';
import { LinkedAccount as TLinkedAccount, PartnerEntity, AvailableWallet } from '@getpara/web-sdk';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { useEffect, useMemo } from 'react';
import { safeStyled } from '@getpara/react-common';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { Waiting } from '../Waiting/Waiting.js';
import { AccountLinkEntry, WalletEntry } from './AccountProfileEntry.js';

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
  const { isEnabled: isAccountLinkingEnabled, linkAccount } = useAccountLinking();
  const hideWallets = useStore(state => state.modalConfig?.hideWallets);
  const { switchWallets, switchWalletsUrl, setSwitchWalletsUrl, isSwitchWalletsPending } = useAuthActions();
  const setStep = useModalStore(state => state.setStep);

  const partnerGroups = useMemo(() => {
    return embedded?.wallets?.reduce((acc: { partner: Partial<PartnerEntity>; wallets: AvailableWallet[] }[], wallet) => {
      if (!wallet.partner || !wallet.partner.id || !wallet.partner.displayName) return acc;

      const partnerGroup = acc.find(group => group.partner.id === wallet.partner?.id);

      return !!partnerGroup
        ? acc.map(group =>
            group.partner.id === wallet.partner!.id ? { ...group, wallets: [...group.wallets, wallet] } : group,
          )
        : [...acc, { partner: wallet.partner, wallets: [wallet] }];
    }, []);
  }, [embedded?.wallets]);

  useEffect(() => {
    if (para) {
      para.getSwitchWalletsUrl().then(url => {
        setSwitchWalletsUrl(url);
      });
    }
  }, []);

  if (!para || !switchWalletsUrl) {
    return <Waiting />;
  }

  return (
    <StepContainer>
      {/* Embedded Wallets Section - only show if there are embedded wallets */}
      {partnerGroups && partnerGroups.length > 0 && (
        <Section>
          {partnerGroups.map(({ partner, wallets }) => {
            return (
              <Section key={partner.id}>
                <Title variant="bodyS" color="secondary">
                  {partner.displayName} Wallets
                </Title>
                <Content>
                  {wallets.map(wallet => (
                    <WalletEntry key={`${wallet.address}-${wallet.type}`} wallet={wallet} isSelectable />
                  ))}
                </Content>
              </Section>
            );
          })}
          {!embedded.isGuestMode && (
            <CpslButton fullWidth variant="tertiary" onClick={switchWallets} disabled={isSwitchWalletsPending}>
              {isSwitchWalletsPending ? (
                'Please Wait...'
              ) : (
                <>
                  <CpslIcon icon="shuffle" slot="start" size="16px" />
                  {para.isMultiWallet ? 'Switch Wallets' : 'Switch Wallet'}
                </>
              )}
            </CpslButton>
          )}
        </Section>
      )}

      {/* Connected Wallets Section */}
      {!embedded.isGuestMode && (
        <Section>
          <Title variant="bodyS" color="secondary">
            Connected Wallets
          </Title>
          <Content>
            {para.availableWallets
              .filter(({ isExternal }) => isExternal)
              .map(wallet => {
                return <WalletEntry key={wallet.address} wallet={wallet} isSelectable />;
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
      )}

      {isAccountLinkingEnabled && (
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
                  return (
                    <AccountLinkEntry
                      key={linkedAccount.id}
                      accountLink={linkedAccount}
                      isPrimary={linkedAccount.isPrimary}
                    />
                  );
                })}
            </GradientScroll>
            <CpslButton fullWidth variant="tertiary" onClick={() => linkAccount(undefined)}>
              <CpslIcon icon="userPlus" slot="start" size="16px" />
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

const DisconnectButton = safeStyled(CpslButton)`
  --button-border-width: 0px;
  --button-destructive-hover-background-color: rgba(255, 0, 0, 0.2);
  --button-destructive-active-background-color: rgba(255, 0, 0, 0.1);
`;
