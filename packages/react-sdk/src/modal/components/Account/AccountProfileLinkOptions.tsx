import { AuthInput } from '../AuthInput/AuthInput.js';
import { AccountTypeIcon, GradientScroll, StepContainer } from '../common.js';
import styled from 'styled-components';
import { CpslButton, CpslDivider, CpslText } from '@getpara/react-components';
import { getAccountTypeName } from '../../constants/oAuthLogos.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { useEffect, useMemo } from 'react';
import { EXTERNAL_WALLET_TYPES, TExternalWallet, TLinkedAccountType } from '@getpara/web-sdk';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

function isExternalWallet(str: TLinkedAccountType | TExternalWallet): str is TExternalWallet {
  return (EXTERNAL_WALLET_TYPES as unknown as string[]).includes(str as string);
}

type Option = Exclude<TLinkedAccountType, 'EXTERNAL_WALLET'> | TExternalWallet;

export function AccountProfileLinkOptions() {
  const para = useInternalClient();
  const { accountLinkOptions, linkAccount, isLinkAccountPending, linkAccountError, setLinkAccountError, resetMutations } =
    useAccountLinking();
  const { wallet: connectedWallet, wallets } = useExternalWallets();

  const [isEmail, isPhone, externalWalletIndex, isOptions] = [
    accountLinkOptions.includes('EMAIL'),
    accountLinkOptions.includes('PHONE'),
    accountLinkOptions.indexOf('EXTERNAL_WALLET'),
    (accountLinkOptions || []).filter(o => o !== 'EMAIL' && o !== 'PHONE').length > 0,
  ];

  const options = useMemo<Option[]>(() => {
    const baseOptions: Option[] =
      externalWalletIndex >= 0
        ? [
            ...(accountLinkOptions.slice(0, externalWalletIndex) as Option[]),
            ...EXTERNAL_WALLET_TYPES,
            ...(accountLinkOptions.slice(externalWalletIndex + 1) as Option[]),
          ]
        : (accountLinkOptions as Option[]);

    return Array.from(
      new Set(
        baseOptions.filter(option => {
          if (
            !isExternalWallet(option) ||
            (connectedWallet?.internalId !== option &&
              wallets.some(({ type, internalId, installed, isMobile }) => {
                return (
                  (installed || isMobile) &&
                  para?.supportedWalletTypes.some(obj => obj.type === type) &&
                  internalId === option
                );
              }))
          ) {
            return true;
          }
          return false;
        }),
      ),
    );
  }, [accountLinkOptions, externalWalletIndex, wallets]);

  useEffect(() => {
    resetMutations();

    setLinkAccountError(null);
  }, []);

  // Intentionally returning undefined if there is more than one option to indicate that the type selection screen is needed.
  const getExternalWalletType = (internalId: string) => {
    const allWallets = wallets.filter(wallet => wallet.internalId === internalId);
    if (allWallets.length === 1) {
      return allWallets[0].type;
    }
    return undefined;
  };

  return (
    <StepContainer $wide>
      <Content>
        {(isEmail || isPhone) && (
          <>
            <AuthInput
              disableEmailLogin={!isEmail}
              disablePhoneLogin={!isPhone}
              onSubmit={auth => {
                linkAccount({
                  auth,
                });
              }}
              error={
                linkAccountError
                  ? linkAccountError === 'CONFLICT'
                    ? 'Account already linked'
                    : 'An unknown error occurred'
                  : undefined
              }
              isSubmitting={isLinkAccountPending}
            />
            {isOptions && <CpslDivider>or</CpslDivider>}
          </>
        )}

        {isOptions && (
          <GradientScroll height="320px">
            {options
              .filter(option => option !== 'EMAIL' && option !== 'PHONE')
              .map(option => {
                const isWallet = isExternalWallet(option);
                return (
                  <Option
                    fullWidth
                    variant="tertiary"
                    key={option}
                    onClick={() =>
                      linkAccount(
                        isWallet
                          ? { externalWallet: { internalId: option, type: getExternalWalletType(option) } }
                          : { type: option },
                      )
                    }
                  >
                    <AccountTypeIcon accountType={option} size="24px" />
                    <CpslText color="contrast" variant="bodyM">
                      {getAccountTypeName(option)}
                    </CpslText>
                  </Option>
                );
              })}
          </GradientScroll>
        )}
      </Content>
    </StepContainer>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

const Option = styled(CpslButton)`
  --button-justify-content: flex-start;

  height: 48px;
  display: flex;
  align-items: flex-start;
`;
