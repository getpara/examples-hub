import { safeStyled } from '@getpara/react-common';
import { TOAuthMethod } from '@getpara/web-sdk';
import { AuthMainStepContent } from './AuthMainStepContent.js';
import { CenteredText } from '../common.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useModalStore } from '../../stores/index.js';

interface AuthMainStepProps {
  oAuthMethods?: TOAuthMethod[];
  disableEmailLogin: boolean;
  disablePhoneLogin: boolean;
  isGuestModeEnabled?: boolean;
}

export const AuthMainStep = ({
  oAuthMethods,
  disableEmailLogin,
  disablePhoneLogin,
  isGuestModeEnabled = false,
}: AuthMainStepProps) => {
  const authLayout = useModalStore(state => state.authLayout);
  const embeddedModal = useStore(state => state.modalConfig?.embeddedModal);
  const logo = useStore(state => state.modalConfig?.logo);
  const appName = useStore(state => state.appName);

  const firstLayoutType = authLayout?.[0].split(':')[0];
  const heading = firstLayoutType === 'AUTH' ? 'Sign Up or Login' : 'Connect Wallet';

  return (
    <>
      {logo && <Logo src={logo} alt={`${appName ? `${appName} -` : ''}logo`} />}
      {!embeddedModal && (
        <CenteredText variant={logo ? 'bodyM' : 'headingS'} weight="semiBold">
          {heading}
        </CenteredText>
      )}
      <AuthMainStepContent
        disableEmailLogin={disableEmailLogin}
        disablePhoneLogin={disablePhoneLogin}
        isGuestModeEnabled={isGuestModeEnabled}
        oAuthMethods={oAuthMethods}
      />
    </>
  );
};

const Logo = safeStyled.img`
  height: 100px;
  max-width: 260px;
  object-fit: contain;
  box-sizing: content-box;
  align-self: center;
`;
