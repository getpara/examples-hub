import { AuthMethod, OAuthMethod } from '@getpara/web-sdk';
import { styled } from 'styled-components';
import { useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { openPopup } from '../../utils/openPopup.js';
import { getTileButtonFlex } from '../../utils/getTileButtonFlex.js';
import { StyledCpslTileButton } from '../common.js';
import { brandedOAuthLogos, oAuthLogos } from '../../constants/oAuthLogos.js';
import { useEffect } from 'react';
import { routeMobileExternalWallet } from '../../utils/routeMobileExternalWallet.js';
import { useGoBack } from '../../hooks/useGoBack.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { useStore } from '../../../provider/stores/useStore.js';

interface OAuthProps {
  methods: OAuthMethod[];
}

const HAS_MORE_LENGTH = 3;

export const OAuth = ({ methods }: OAuthProps) => {
  const goBack = useGoBack();
  const oAuthLogoVariant = useStore(state => state.oAuthLogoVariant);
  const isDark = useStore(state => state.isDarkTheme);
  const para = useInternalClient();
  const refs = useModalStore(state => state.refs);
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setAuthInfo = useUserInfoStore(state => state.setAuthInfo);
  const setSupportedAuthMethods = useModalStore(state => state.setSupportedAuthMethods);
  const setBiometricLocationHints = useModalStore(state => state.setBiometricLocationHints);
  const setFarcasterConnectUri = useModalStore(state => state.setFarcasterConnectUri);
  const farcasterConnectUri = useModalStore(state => state.farcasterConnectUri);
  const showAll = useModalStore(state => state.step === ModalStep.AUTH_MORE);
  const setIFrameUrl = useModalStore(state => state.setIFrameUrl);
  const setIsIFrameReady = useModalStore(state => state.setIsIFrameReady);
  const setAuthStepRoute = useModalStore(state => state.setAuthStepRoute);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const theme = useStore(state => state.modalConfig?.theme);

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
    switch (method) {
      case OAuthMethod.FARCASTER:
        if (!farcasterConnectUri) {
          return;
        }

        routeMobileExternalWallet(farcasterConnectUri);
        setStep(ModalStep.FARCASTER_OAUTH);
        break;
      case OAuthMethod.TELEGRAM:
        setStep(ModalStep.TELEGRAM_OAUTH);
        break;
      default:
        setStep(ModalStep.AWAITING_OAUTH);

        const oAuthURL = await para.getOAuthURL({ method });
        refs.popupWindow.current = openPopup({
          url: oAuthURL,
          target: `${method}AuthPopup`,
          type: 'OAUTH',
          current: refs.popupWindow.current,
        });

        const { email, isError, userExists } = await para.waitForOAuth({ popupWindow: refs.popupWindow.current });

        refs.popupWindow.current = null;

        if (isError || !email) {
          if (refs.currentStep.current === ModalStep.AWAITING_OAUTH) {
            goBack();
          }
          return;
        }

        setAuthInfo({ email });

        if (userExists) {
          const supportedAuthMethods = await para.initiateUserLoginV2({ email });

          if (supportedAuthMethods.size > 0) {
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

        const supportedCreateAuthMethods = await para.getSupportedCreateAuthMethods();

        setIsIFrameReady(false);
        setFlow('signUp');
        const supportsPasskey = supportedCreateAuthMethods.has(AuthMethod.PASSKEY);
        const supportsPassword = supportedCreateAuthMethods.has(AuthMethod.PASSWORD);

        if (supportsPasskey) {
          setWebAuthURLForCreate(await para.shortenLoginLink(await para.getSetUpBiometricsURL({ authType: 'email' })));

          if (!supportsPassword) {
            setStep(ModalStep.BIOMETRIC_CREATION);
            return;
          }
        }
        if (supportsPassword) {
          setIFrameUrl(await para.shortenLoginLink(await para.getSetupPasswordURL({ authType: 'email', theme })));
        }

        setAuthStepRoute(supportsPasskey ? ModalStep.BIOMETRIC_CREATION : ModalStep.PASSWORD_CREATION);
        break;
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
