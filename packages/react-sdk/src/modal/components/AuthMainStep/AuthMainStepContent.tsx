import { Fragment, ReactNode, useMemo } from 'react';
import { CpslButton, CpslDivider, CpslIconGroup, IconType } from '@usecapsule/react-components';
import styled from 'styled-components';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { useExternalWallets } from '../../providers/ExternalWalletContext.js';
import { ExternalWallets } from '../ExternalWallets/ExternalWallets.js';
import { useModalStore, useThemeStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { AuthLayout } from '../../types/modalProps.js';
import { brandedOAuthLogos, oAuthLogos } from '../../constants/oAuthLogos.js';
import { AuthOptions } from '../AuthOptions/AuthOptions.js';

interface AuthMainStepContentProps {
  oAuthMethods?: OAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
}

export const AuthMainStepContent = ({ oAuthMethods, disableEmailLogin, disablePhoneLogin }: AuthMainStepContentProps) => {
  const { wallets } = useExternalWallets();
  const authLayout = useThemeStore(state => state.authLayout);
  const setStep = useModalStore(state => state.setStep);
  const oAuthLogoVariant = useThemeStore(state => state.oAuthLogoVariant);
  const isDark = useThemeStore(state => state.isDark);

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

    authLayout.forEach(layout => {
      switch (layout) {
        case AuthLayout.AUTH_FULL: {
          methods.push([
            <AuthOptions
              key="authFull"
              oAuthMethods={oAuthMethods}
              disableEmailLogin={disableEmailLogin}
              disablePhoneLogin={disablePhoneLogin}
            />,
            layout,
          ]);

          break;
        }
        case AuthLayout.AUTH_CONDENSED: {
          const icons: IconType[] = [];

          oAuthMethods?.forEach(method => icons.push(useBrandedLogos ? brandedOAuthLogos[method] : oAuthLogos[method]));

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
  }, [oAuthMethods, disableEmailLogin, disablePhoneLogin, wallets]);

  return <Container data-testid="main-auth-step-content">{Content}</Container>;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledIconGroup = styled(CpslIconGroup)<{ $isDark: boolean }>`
  --icon-item-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
  flex: 1;
  justify-content: flex-end;
`;

const IconGroupSpacer = styled(StyledIconGroup)`
  visibility: hidden;
`;

const CondensedButton = styled(CpslButton)`
  --button-justify-content: space-between;

  &::part(button-native) {
    max-height: 50px;
  }
`;
