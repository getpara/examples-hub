import { HeroSpinner } from '@getpara/react-common';
import { CpslButton, CpslIcon } from '@getpara/react-components';
import { ReactNode, useEffect, useMemo } from 'react';
import { HeroAccountTypeIcon, HeroSuccessIcon } from '../common.js';
import { VerificationCode } from '../VerificationCodeStep/VerificationCodeStep.js';
import { AuthInfo, extractAuthInfo } from '@getpara/user-management-client';
import { FarcasterConnectQR } from '../OAuth/FarcasterOAuthStep.js';
import { useTelegramLogin } from '../../hooks/useTelegramLogin.js';
import { TelegramIFrame } from '../OAuth/TelegramOAuthStep.js';
import { AuthInput } from '../AuthInput/AuthInput.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';
import { useResendVerificationCode } from '../../../provider/index.js';

export function AccountProfileLink() {
  const {
      accountLinkInProgress,
      verifyEmailOrPhoneLink,
      linkAccountStatus,
      linkAccountError,
      verifyTelegramLink,
      linkAccount,
      isLinkAccountPending,
      resetMutations,
    } = useAccountLinking(),
    { mutate: resendVerificationCode } = useResendVerificationCode(),
    accountLinkType = accountLinkInProgress?.type,
    externalWalletType = accountLinkInProgress?.pendingWalletType ?? accountLinkInProgress?.externalWallet?.providerId,
    accountLinkIcon = externalWalletType ?? accountLinkType,
    isTelegram = accountLinkType === 'TELEGRAM',
    {
      url,
      status: telegramStatus,
      isLoaded,
      setIsLoaded,
    } = useTelegramLogin(
      isTelegram ? { isActive: isTelegram, status: linkAccountStatus, onSubmit: verifyTelegramLink } : { isActive: false },
    ),
    status = accountLinkInProgress?.isComplete ? 'success' : isTelegram ? telegramStatus : linkAccountStatus;

  const { upper, lower } = useMemo<{ upper: ReactNode; lower: ReactNode }>(() => {
    let upper: ReactNode = null,
      lower: ReactNode = null;

    let message;
    switch (status) {
      case 'pending':
        message = externalWalletType ? 'Confirm wallet connection' : 'Confirm login request';
        break;
      case 'success':
        message = 'Account linked';
        break;
      case 'error':
        message =
          linkAccountError && linkAccountError === 'CONFLICT'
            ? 'Account already linked'
            : externalWalletType
              ? 'Connection failed'
              : 'Login failed';
        break;
      default:
        message = null;
    }

    const heroSpinner = (
      <HeroSpinner
        status={status}
        icon={status === 'success' ? <HeroSuccessIcon /> : <HeroAccountTypeIcon accountType={accountLinkIcon!} />}
        text={message}
      />
    );

    const onTryAgain = externalWalletType
      ? () => linkAccount({ externalWallet: externalWalletType })
      : accountLinkType && accountLinkType !== 'EXTERNAL_WALLET'
        ? () => linkAccount({ type: accountLinkType })
        : undefined;

    const tryAgain = onTryAgain ? (
      <CpslButton variant="secondary" fullWidth onClick={onTryAgain}>
        <CpslIcon icon="refresh" slot="start" />
        Try Again
      </CpslButton>
    ) : null;

    if (!accountLinkInProgress) {
      return { upper, lower };
    }

    switch (true) {
      // Email or phone input
      case !accountLinkInProgress.identifier &&
        (accountLinkInProgress.type === 'EMAIL' || accountLinkInProgress.type === 'PHONE'):
        upper = heroSpinner;
        lower = (
          <AuthInput
            disableEmailLogin={accountLinkInProgress.type !== 'EMAIL'}
            disablePhoneLogin={accountLinkInProgress.type !== 'PHONE'}
            onSubmit={auth => {
              try {
                linkAccount({
                  auth,
                });
              } catch (e) {
                throw e;
              }
            }}
            error={linkAccountError === 'CONFLICT' ? 'Account already linked' : undefined}
            isSubmitting={isLinkAccountPending}
            disableSubmitButton
          >
            {({ isSubmitting, onSubmit, isPending }) => {
              return (
                <CpslButton variant="primary" onClick={onSubmit} disabled={isPending || isSubmitting} fullWidth>
                  Link {accountLinkType === 'EMAIL' ? 'Email Address' : 'Phone Number'}
                </CpslButton>
              );
            }}
          </AuthInput>
        );
        break;

      // Verify email or phone code
      case (accountLinkType === 'EMAIL' || accountLinkType === 'PHONE') &&
        accountLinkInProgress?.identifier &&
        status !== 'success':
        {
          const authInfo = extractAuthInfo(
            accountLinkType === 'EMAIL'
              ? { email: accountLinkInProgress.identifier }
              : { phone: accountLinkInProgress.identifier },
            { isRequired: true },
          ) as AuthInfo<'email' | 'phone'>;

          lower = (
            <VerificationCode
              authInfo={authInfo}
              onSubmit={verifyEmailOrPhoneLink}
              onResend={() => {
                resendVerificationCode({ type: 'LINK_ACCOUNT' });
              }}
              status={linkAccountStatus}
              error={linkAccountError}
            />
          );
        }
        break;

      // Farcaster Connect QR
      case accountLinkType === 'FARCASTER' && status !== 'success':
        lower = <FarcasterConnectQR />;
        break;

      // OAuth, External Wallet, Telegram
      default:
        upper = heroSpinner;
        switch (true) {
          case accountLinkType === 'EXTERNAL_WALLET':
            break;

          case accountLinkType === 'TELEGRAM':
            lower = (
              <TelegramIFrame
                url={url}
                isLoaded={isLoaded}
                setIsLoaded={setIsLoaded}
                isVisible={status === 'error' || status === 'idle'}
              />
            );
            break;
          case status === 'error' && !!accountLinkInProgress:
            lower = tryAgain;
            break;
        }
        break;
    }

    return {
      upper,
      lower,
    };
  }, [
    accountLinkType,
    accountLinkInProgress,
    telegramStatus,
    url,
    isLoaded,
    linkAccount,
    status,
    isTelegram,
    externalWalletType,
  ]);

  useEffect(() => {
    return () => {
      resetMutations();
    };
  }, []);

  return (
    <>
      {upper}
      {lower}
    </>
  );
}
