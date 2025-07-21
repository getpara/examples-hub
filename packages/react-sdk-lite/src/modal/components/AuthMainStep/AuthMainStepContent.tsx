import { Fragment, ReactNode, useMemo } from 'react';
import { CpslButton, CpslDivider, CpslIcon, CpslIconGroup, IconType } from '@getpara/react-components';
import { safeStyled } from '@getpara/react-common';
import { TOAuthMethod } from '@getpara/web-sdk';
import { ExternalWallets } from '../ExternalWallets/ExternalWallets.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { AuthLayout } from '../../types/modalProps.js';
import { ACCOUNT_TYPES } from '../../constants/oAuthLogos.js';
import { AuthOptions } from '../AuthOptions/AuthOptions.js';
import { useExternalWallets } from '../../../provider/providers/ExternalWalletProvider.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';
import { useAccount, useParaStatus } from '../../../provider/index.js';

interface AuthMainStepContentProps {
  oAuthMethods?: TOAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  isGuestModeEnabled?: boolean;
}

export const AuthMainStepContent = ({
  oAuthMethods,
  disableEmailLogin,
  disablePhoneLogin,
  isGuestModeEnabled = false,
}: AuthMainStepContentProps) => {
  const { wallets, connectFarcasterMiniApp } = useExternalWallets();
  const { createGuestWallets } = useAuthActions();
  const { isFarcasterMiniApp } = useParaStatus();
  const { embedded } = useAccount();
  const authLayout = useModalStore(state => state.authLayout);
  const setStep = useModalStore(state => state.setStep);
  const oAuthLogoVariant = useStore(state => state.oAuthLogoVariant);
  const isDark = useStore(state => state.modalConfig?.theme?.mode === 'dark');
  const isGuestMode = embedded?.isConnected && embedded.isGuestMode;

  const useBrandedLogos = oAuthLogoVariant === 'default';
  const useDarkLogos = useBrandedLogos ? isDark : oAuthLogoVariant !== 'dark';

  const handleCondensedAuthClick = () => {
    setStep(ModalStep.AUTH_MORE);
  };

  const handleCondensedExternalClick = () => {
    setStep(ModalStep.EX_WALLET_MORE);
  };

  const Content = useMemo(() => {
    const methods: [ReactNode, string][] = [];

    if (isFarcasterMiniApp) {
      methods.push([
        <FarcasterButton variant="primary" fullWidth onClick={connectFarcasterMiniApp}>
          <CpslIcon slot="start" icon="farcaster" />
          Continue with Farcaster
        </FarcasterButton>,
        'FARCASTER',
      ]);
    }

    authLayout?.forEach(layout => {
      switch (layout) {
        case AuthLayout.AUTH_FULL: {
          methods.push([
            <AuthOptions
              key="authFull"
              oAuthMethods={oAuthMethods}
              disableEmailLogin={disableEmailLogin}
              disablePhoneLogin={disablePhoneLogin}
              isGuestModeEnabled={isGuestModeEnabled}
            />,
            layout,
          ]);

          break;
        }
        case AuthLayout.AUTH_CONDENSED: {
          const icons: IconType[] = [];

          oAuthMethods?.forEach(method => icons.push(ACCOUNT_TYPES[method][useBrandedLogos ? 'logoBranded' : 'logo']!));

          methods.push([
            <CondensedButton onClick={handleCondensedAuthClick} variant="tertiary" fullWidth key="authCondensed">
              <IconGroupSpacer slot="start" icons={[]} $isDark={useDarkLogos} />
              Sign Up or Login
              <StyledIconGroup slot="end" icons={icons.splice(0, 3)} $isDark={useDarkLogos} />
            </CondensedButton>,
            layout,
          ]);

          break;
        }
        case AuthLayout.EXTERNAL_FULL: {
          if (!!wallets.length) {
            methods.push([<ExternalWallets key="externalWallets" />, layout]);
          }
          break;
        }
        case AuthLayout.EXTERNAL_CONDENSED: {
          const icons: string[] = [];

          wallets?.forEach(wallet => icons.push(wallet.iconUrl));

          methods.push([
            <CondensedButton onClick={handleCondensedExternalClick} variant="tertiary" fullWidth key="authCondensed">
              <IconGroupSpacer slot="start" icons={[]} $isDark={useDarkLogos} />
              Connect Wallet
              <StyledIconGroup slot="end" icons={icons.splice(0, 3)} $isDark={useDarkLogos} />
            </CondensedButton>,
            layout,
          ]);

          break;
        }
        default: {
          break;
        }
      }
    });

    return (
      <>
        {methods.map(([reactNode, key], index) => (
          <Fragment key={key}>
            {reactNode}
            {methods.length > 1 && index < methods.length - 1 && <CpslDivider key="or">or</CpslDivider>}
          </Fragment>
        ))}
      </>
    );
  }, [isFarcasterMiniApp, oAuthMethods, disableEmailLogin, disablePhoneLogin, isGuestModeEnabled, wallets, authLayout]);

  return (
    <Container data-testid="main-auth-step-content">
      {Content}
      {isGuestModeEnabled && !isGuestMode && !isFarcasterMiniApp && (
        <GuestMode
          href="#"
          $isDark={isDark}
          onClick={e => {
            e.preventDefault();
            createGuestWallets();
          }}
        >
          Continue as Guest
        </GuestMode>
      )}
    </Container>
  );
};

const Container = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledIconGroup = safeStyled(CpslIconGroup)<{ $isDark: boolean }>`
  --icon-item-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
  flex: 1;
  justify-content: flex-end;
`;

const IconGroupSpacer = safeStyled(StyledIconGroup)`
  visibility: hidden;
`;

const CondensedButton = safeStyled(CpslButton)`
  --button-justify-content: space-between;

  &::part(button-native) {
    max-height: 50px;
  }
`;

const GuestMode = safeStyled.a<{ $isDark?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 50px;
  color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  font-family: var(--cpsl-font-family);

  &:hover {
    text-decoration: underline;
  }
`;

const FarcasterButton = safeStyled(CpslButton)`
  --button-primary-icon-color: white;
  --button-primary-hover-icon-color: white;
  --button-primary-active-icon-color: white;
  --button-primary-background-color: #7e50d1;
  --button-primary-hover-background-color: #8A63D2;
  --button-primary-active-background-color: #8A63D2;
  --button-primary-color: white;
  --button-primary-hover-color: white;
  --button-primary-active-color: white;
`;
