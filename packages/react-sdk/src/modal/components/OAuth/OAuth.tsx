import { OAuthMethod } from '@usecapsule/web-sdk';
import { styled } from 'styled-components';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { openPopup } from '../../utils/openPopup.js';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { getTileButtonFlex } from '../../utils/getTileButtonFlex.js';
import { StyledCpslTileButton } from '../common.js';
import { brandedOAuthLogos, oAuthLogos } from '../../constants/oAuthLogos.js';

interface OAuthProps {
  methods: OAuthMethod[];
}

const HAS_MORE_LENGTH = 3;

export const OAuth = ({ methods }: OAuthProps) => {
  const oAuthLogoVariant = useThemeStore(state => state.oAuthLogoVariant);
  const isDark = useThemeStore(state => state.isDark);
  const capsule = useCapsuleStore(state => state.capsule);
  const setFlow = useModalStore(state => state.setFlow);
  const setStep = useModalStore(state => state.setStep);
  const setIdentifier = useUserInfoStore(state => state.setIdentifier);
  const setIdentifierType = useUserInfoStore(state => state.setIdentifierType);
  const setWebAuthURLForLogin = useModalStore(state => state.setWebAuthURLForLogin);
  const setWebAuthURLForCreate = useModalStore(state => state.setWebAuthURLForCreate);
  const showAll = useModalStore(state => state.step === ModalStep.AUTH_MORE);
  const hasMore = methods.length > HAS_MORE_LENGTH;

  const methodsToShow = showAll || !hasMore ? methods : methods.slice(0, HAS_MORE_LENGTH - 1);

  const handleShowAll = () => {
    setStep(ModalStep.AUTH_MORE);
  };

  const handleMethodClick = (method: OAuthMethod) => async () => {
    if (method === OAuthMethod.FARCASTER) {
      setStep(ModalStep.FARCASTER_OAUTH);
      return;
    }

    setStep(ModalStep.AWAITING_OAUTH);

    const oAuthURL = await capsule.getOAuthURL(method);
    openPopup(oAuthURL, `${method}AuthPopup`, 'OAUTH');
    const { email, userExists } = await capsule.waitForOAuth();
    if (!email) {
      setStep(ModalStep.AUTH_MAIN);
      throw new Error('email is required');
    }

    setIdentifier(email);
    setIdentifierType('email');

    if (userExists) {
      const webAuthUrlForLogin = await capsule.initiateUserLogin(email);
      setFlow('login');
      setWebAuthURLForLogin(webAuthUrlForLogin);
      setStep(ModalStep.BIOMETRIC_LOGIN);
    } else {
      const webAuthURLForCreate = await capsule.getSetUpBiometricsURL(false);
      setFlow('signUp');
      setWebAuthURLForCreate(webAuthURLForCreate);
      setStep(ModalStep.BIOMETRIC_CREATION);
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
