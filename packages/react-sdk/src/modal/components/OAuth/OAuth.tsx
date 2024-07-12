import { CpslTileButton } from '@usecapsule/react-components';
import { OAuthMethod } from '@usecapsule/web-sdk';
import { styled } from 'styled-components';
import { useCapsuleStore, useModalStore, useUserInfoStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { openPopup } from '../../utils/openPopup.js';
import { brandedOAuthLogos, oAuthLogos } from './config.js';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { Text } from '../common.js';

interface OAuthProps {
  methods: OAuthMethod[];
}

const HAS_MORE_LENGTH = 4;

export const OAuth = ({ methods }: OAuthProps) => {
  const oAuthLogoVariant = useThemeStore((state) => state.oAuthLogoVariant);
  const isDark = useThemeStore((state) => state.isDark);
  const capsule = useCapsuleStore((state) => state.capsule);
  const setFlow = useModalStore((state) => state.setFlow);
  const setStep = useModalStore((state) => state.setStep);
  const setEmail = useUserInfoStore((state) => state.setEmail);
  const setWebAuthURLForLogin = useModalStore((state) => state.setWebAuthURLForLogin);
  const setWebAuthURLForCreate = useModalStore((state) => state.setWebAuthURLForCreate);
  const showAll = useModalStore((state) => state.step === ModalStep.SIGN_UP_ALL_OAUTH);
  const hasMore = methods.length > HAS_MORE_LENGTH;

  const methodsToShow = showAll || !hasMore ? methods : methods.slice(0, HAS_MORE_LENGTH - 1);

  const handleShowAll = () => {
    setStep(ModalStep.SIGN_UP_ALL_OAUTH);
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
      setStep(ModalStep.SIGN_UP);
      throw new Error('email is required');
    }

    setEmail(email);

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

  return (
    <OAuthContainer>
      {methodsToShow.map((method) => (
        <StyledCpslTileButton
          $isDark={useDarkLogos}
          key={method}
          icon={useBrandedLogos ? brandedOAuthLogos[method] : oAuthLogos[method]}
          onClick={handleMethodClick(method)}
          hasFullRow={methodsToShow.length >= 4}
        />
      ))}
      {!showAll && hasMore && (
        <MoreButton $isDark={useDarkLogos} icon="moreLoginOptions" onClick={handleShowAll} hasFullRow>
          <MoreText $isDark={useDarkLogos}>MORE</MoreText>
        </MoreButton>
      )}
    </OAuthContainer>
  );
};

const OAuthContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
`;

const StyledCpslTileButton = styled(CpslTileButton)<{ $isDark: boolean; hasFullRow: boolean }>`
  flex: ${({ hasFullRow }) => (hasFullRow ? '0 0 calc(25% - 4px)' : '1')};

  --button-icon-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
  --button-width: 100%;
`;

const MoreButton = styled(StyledCpslTileButton)`
  &::part(icon) {
    --height: 16px;
    --width: 16px;
  }
`;

const MoreText = styled(Text)<{ $isDark: boolean }>`
  font-size: 8px;
  line-height: 8px;
  letter-spacing: 1px;
  color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
`;
