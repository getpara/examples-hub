import styled from 'styled-components';
import { AccountTypeIcon, GradientScroll, StepContainer } from '../common.js';
import { CpslButton, CpslIcon, CpslIdenticon, CpslText } from '@getpara/react-components';
import { useAccount, useClient } from '../../../provider/index.js';
import { useLinkedAccounts } from '../../../provider/hooks/index.js';
import { getWalletDisplayName } from '../../utils/getWalletDisplayName.js';
import { LinkedAccount as TLinkedAccount, truncateAddress } from '@getpara/web-sdk';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { ReactNode } from 'react';
import { safeStyled, useCopyToClipboard } from '@getpara/react-common';
import { getAccountTypeName } from '../../constants/oAuthLogos.js';

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

export const AccountProfile = () => {
  const para = useClient();
  const { data: account } = useAccount();
  const { data: linkedAccounts } = useLinkedAccounts();
  const { isEnabled, linkAccount, unlinkAccount } = useAccountLinking();

  if (!para) {
    return null;
  }

  const externalWallet = account?.externalWallet;

  return (
    <StepContainer $wide>
      <Section>
        <Title variant="bodyS" color="secondary">
          Connected Wallets
        </Title>
        <Content>
          {externalWallet ? (
            <Entry
              key={externalWallet.address}
              icon={<AccountTypeIcon accountType={externalWallet.providerId} size="24px" />}
              name={externalWallet.ensName ?? getAccountTypeName(externalWallet.providerId) ?? ''}
              address={externalWallet.addressBech32 ?? externalWallet.address}
              addressShort={truncateAddress(externalWallet.addressBech32 ?? externalWallet.address, externalWallet.type, {
                prefix: para.cosmosPrefix,
              })}
            />
          ) : (
            account?.wallets?.map(wallet => (
              <Entry
                key={wallet.address}
                icon={
                  wallet.isExternal ? (
                    <AccountTypeIcon accountType={wallet.externalProviderId ?? 'EXTERNAL_WALLET'} size="24px" />
                  ) : (
                    <CpslIdenticon hash={para.getIdenticonHash(wallet.id, wallet.type)} size="24px" arcWidth="40%" />
                  )
                }
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
              {[
                ...(linkedAccounts?.primary || []).map(p => ({ ...p, isPrimary: true })),
                ...(linkedAccounts?.linked || []),
              ].map((linkedAccount: TLinkedAccount & { isPrimary?: boolean }) => {
                const { identifier, displayName, type, isPrimary = false, externalWallet } = linkedAccount;

                return (
                  <Entry
                    key={identifier}
                    icon={<AccountTypeIcon accountType={externalWallet?.providerId ?? type} size="24px" />}
                    name={
                      externalWallet
                        ? (externalWallet.ensName ?? getAccountTypeName(externalWallet.providerId) ?? '')
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
    </StepContainer>
  );
};

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
  width: 100%;
`;

const Content = styled(Section)``;

const Title = styled(CpslText)``;

const EntryContainer = safeStyled.div`
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

const EntryUnlink = styled.a<{ isDark?: boolean }>`
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
