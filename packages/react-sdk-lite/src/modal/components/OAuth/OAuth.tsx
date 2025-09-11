import { TOAuthMethod } from '@getpara/web-sdk';
import { ACCOUNT_TYPES, safeStyled } from '@getpara/react-common';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { getTileButtonFlex } from '../../utils/getTileButtonFlex.js';
import { StyledCpslTileButton } from '../common.js';
import { useStore } from '../../../provider/stores/useStore.js';
import { useAuthActions } from '../../../provider/providers/AuthProvider.js';

interface OAuthProps {
  methods: TOAuthMethod[];
}

const HAS_MORE_LENGTH = 3;

export const OAuth = ({ methods }: OAuthProps) => {
  const oAuthLogoVariant = useStore(state => state.oAuthLogoVariant);
  const isDark = useStore(state => state.isDarkTheme);
  const setStep = useModalStore(state => state.setStep);
  const showAll = useModalStore(state => state.step === ModalStep.AUTH_MORE || state.step === ModalStep.AUTH_GUEST_SIGNUP);
  const { verifyOAuth } = useAuthActions();

  const hasMore = methods.length > HAS_MORE_LENGTH;

  const methodsToShow = showAll || !hasMore ? methods : methods.slice(0, HAS_MORE_LENGTH - 1);

  const handleShowAll = () => {
    setStep(ModalStep.AUTH_MORE);
  };

  const handleMethodClick = (method: TOAuthMethod) => async () => {
    switch (method) {
      case 'FARCASTER':
        setStep(ModalStep.FARCASTER_OAUTH);
        break;
      case 'TELEGRAM':
        setStep(ModalStep.TELEGRAM_OAUTH);
        break;
      default:
        verifyOAuth(method as Exclude<TOAuthMethod, 'FARCASTER' | 'TELEGRAM'>);
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
          icon={ACCOUNT_TYPES[method][useBrandedLogos ? 'iconBranded' : 'icon']!}
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

const OAuthContainer = safeStyled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const OAuthButton = safeStyled(StyledCpslTileButton)<{ $isDark: boolean; $index: number; $totalItems: number }>`
  flex: ${({ $index, $totalItems }) => getTileButtonFlex($index, $totalItems)};

  --button-icon-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
`;
