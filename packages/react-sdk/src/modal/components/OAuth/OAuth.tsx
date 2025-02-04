import { AuthMethod, OAuthMethod } from '@getpara/web-sdk';
import { styled } from 'styled-components';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { openPopup } from '../../utils/openPopup.js';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { getTileButtonFlex } from '../../utils/getTileButtonFlex.js';
import { StyledCpslTileButton } from '../common.js';
import { brandedOAuthLogos, oAuthLogos } from '../../constants/oAuthLogos.js';
import { useEffect } from 'react';
import { routeMobileExternalWallet } from '../../utils/routeMobileExternalWallet.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';

interface OAuthProps {
  methods: OAuthMethod[];
}

const HAS_MORE_LENGTH = 3;

export const OAuth = ({ methods }: OAuthProps) => {
  const goBack = useGoBack();
  const oAuthLogoVariant = useThemeStore(state => state.oAuthLogoVariant);
  const isDark = useThemeStore(state => state.isDark);
  const para = useInternalClient();
  const popupWindow = useModalStore(state => state.popupWindow);
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setPopupWindow = useModalStore(state => state.setPopupWindow);
  const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);
  const farcasterConnectUri = useModalStore(state => state.farcasterConnectUri);
  const showAll = useModalStore(state => state.step === ModalStep.AUTH_MORE);

  useEffect(() => {
    const initializeFarcaster = async () => {
      if (!methods.includes(OAuthMethod.FARCASTER)) {
        return;
      }

      const connectUri = await para.getFarcasterConnectURL();
      setFarcasterConnectUri(connectUri);
    };

    initializeFarcaster();
  }, []);

  const hasMore = methods.length > HAS_MORE_LENGTH;

  const methodsToShow = showAll || !hasMore ? methods : methods.slice(0, HAS_MORE_LENGTH - 1);

  const handleShowAll = () => {
    setStep(ModalStep.AUTH_MORE);
  };

  const handleMethodClick = (method: OAuthMethod) => async () => {
    if (!!popupWindow) {
      return;
    }
    switch (method) {
      case OAuthMethod.FARCASTER:
        if (!farcasterConnectUri) {
          return;
        }

        routeMobileExternalWallet(farcasterConnectUri);
        setStep(ModalStep.FARCASTER_OAUTH);
        return;
      case OAuthMethod.TELEGRAM:
        setStep(ModalStep.TELEGRAM_OAUTH);
        break;
      default: {
        setStep(ModalStep.AWAITING_OAUTH);

        const oAuthURL = await para.getOAuthURL({ method });
        const oAuthWindow = openPopup(oAuthURL, `${method}AuthPopup`, 'OAUTH');

        setPopupWindow(oAuthWindow);

        const { email, isError, userExists } = await para.waitForOAuth({ popupWindow: oAuthWindow });

        setPopupWindow(undefined);

        if (isError) {
          goBack();
          return;
        }

        if (!email) {
          setStep(ModalStep.AUTH_MAIN);
          throw new Error('email is required');
        }

        setAuthInfo({ email });

        if (userExists) {
          const supportedAuthMethods = await para.initiateUserLoginV2({ email });

          if (supportedAuthMethods.size === 0) {
            setFlow('signUp');
            setStep(ModalStep.BIOMETRIC_CREATION);
          } else {
            const biometricLocationHints = supportedAuthMethods.has(AuthMethod.PASSKEY)
              ? await para.getUserBiometricLocationHints()
              : [];

            setFlow('login');
            setStep(ModalStep.BIOMETRIC_LOGIN);
            setSupportedAuthMethods(supportedAuthMethods);
            setBiometricLocationHints(biometricLocationHints);
            return;
          }
        }

        await para.createUser({ email });
        setFlow('signUp');
        setStep(ModalStep.VERIFICATIONS);
        return;
      }
    }
  };

  const useBrandedLogos = oAuthLogoVariant === 'default';
  const useDarkLogos = useBrandedLogos ? isDark : oAuthLogoVariant !== 'dark';
  const showMoreButton = !showAll && hasMore;

  return (
    <OAuthContainer>
      {methodsToShow.map((method, index) => (
        <OAuthButton
          $isDark={useDarkLogos}
          key={method}
          icon={useBrandedLogos ? brandedOAuthLogos[method] : oAuthLogos[method]}
          onClick={handleMethodClick(method)}
          $index={index}
          $totalItems={showMoreButton ? HAS_MORE_LENGTH : methodsToShow.length}
        />
      ))}
      {showMoreButton && (
        <OAuthButton
          $isDark={useDarkLogos}
          icon="moreLoginOptions"
          onClick={handleShowAll}
          $index={HAS_MORE_LENGTH - 1}
          $totalItems={HAS_MORE_LENGTH}
        />
      )}
    </OAuthContainer>
  );
};

const OAuthContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const OAuthButton = styled(StyledCpslTileButton)<{ $isDark: boolean; $index: number; $totalItems: number }>`
  flex: ${({ $index, $totalItems }) => getTileButtonFlex($index, $totalItems)};

  --button-icon-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
`;
