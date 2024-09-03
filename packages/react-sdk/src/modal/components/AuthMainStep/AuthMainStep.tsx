import styled from 'styled-components';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { AuthMainStepContent } from './AuthMainStepContent.js';
import { CenteredText } from '../common.js';

interface AuthMainStepProps {
  oAuthMethods?: OAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
}

export const AuthMainStep = ({ oAuthMethods, disableEmailLogin }: AuthMainStepProps) => {
  const logo = useThemeStore(state => state.getLogo());
  const appName = useThemeStore(state => state.appName);
  const authLayout = useThemeStore(state => state.authLayout);

  const firstLayoutType = authLayout[0].split(':')[0];
  const heading = firstLayoutType === 'auth' ? 'Sign Up or Login' : 'Connect Wallet';

  return (
    <>
      {logo && <Logo src={logo} alt={`${appName ? `${appName} -` : ''}logo`} />}
      <CenteredText variant={logo ? 'bodyM' : 'headingS'} weight="semiBold">
        {heading}
      </CenteredText>
      <AuthMainStepContent
        disableEmailLogin={disableEmailLogin}
        disablePhoneLogin={disableEmailLogin}
        oAuthMethods={oAuthMethods}
      />
    </>
  );
};

const Logo = styled.img`
  height: 100px;
  max-width: 260px;
  object-fit: contain;
  padding: 16px 0px;
  margin: 16px 0px;
  box-sizing: content-box;
  align-self: center;
`;
