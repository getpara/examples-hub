import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import { styled } from 'styled-components';
import { ModalStep } from '../../utils/steps.js';
import { useModalStore } from '../../stores/index.js';
import { useThemeStore } from '../../stores/theme/useThemeStore.js';
import { CapsuleBlack, CapsuleWhite } from '../Icons.js';
import { useGoBack } from '../../hooks/useGoBack.js';

interface HeaderProps {
  onClose: () => void;
  condenseModal: () => void;
}

export const Header = ({ onClose, condenseModal }: HeaderProps) => {
  const logo = useThemeStore(state => state.getLogo());
  const isDark = useThemeStore(state => state.isDark);
  const bareModal = useThemeStore(state => state.bareModal);
  const appName = useThemeStore(state => state.appName);
  const currentStep = useModalStore(state => state.step);
  const hasPreviousStep = useModalStore(state => state.hasPreviousStep());
  const goBack = useGoBack();

  const handleBackClick = () => {
    goBack();
  };

  return (
    <>
      <Container slot="header" id="header">
        <BackButton
          variant="ghost"
          style={{
            visibility: hasPreviousStep ? 'visible' : 'hidden',
          }}
          onClick={handleBackClick}
        >
          <CpslIcon icon="arrowNarrow" />
        </BackButton>
        <CenterTextContainer>
          {currentStep === ModalStep.SIGN_UP ? (
            <CenterText>
              <span>Sign Up or Log In</span>
            </CenterText>
          ) : (
            <>
              {logo ? (
                <Logo src={logo} alt={`${appName ? `${appName} -` : ''}logo`} />
              ) : (
                <LogoSvg>{isDark ? <CapsuleWhite /> : <CapsuleBlack />}</LogoSvg>
              )}
            </>
          )}
        </CenterTextContainer>
        <CloseButton bareModal={bareModal} variant="ghost" onClick={onClose}>
          <CpslIcon icon="close" />
        </CloseButton>
      </Container>
      <Container slot="footerExpandedHeader" style={{ paddingBottom: 0 }}>
        <ExpandedContainer onClick={condenseModal}>
          <UpArrow icon="arrow" />
          <BackText>
            <span>Back</span>
          </BackText>
        </ExpandedContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 16px;
`;

const HeaderButton = styled(CpslButton)`
  flex: 0;
  --button-padding-top: 0px;
  --button-padding-bottom: 0px;
  --button-padding-start: 0px;
  --button-padding-end: 0px;

  cpsl-icon {
    --height: 20px;
    --width: 20px;
  }
`;

const CloseButton = styled(HeaderButton)<{ bareModal?: boolean }>`
  transform: rotate(180deg);
  visibility: ${({ bareModal }) => (bareModal ? 'hidden' : 'visible')};
`;

const BackButton = styled(HeaderButton)`
  transform: rotate(180deg);
`;

const CenterTextContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterText = styled(CpslText)`
  font-size: 14px;
  color: var(--cpsl-color-text-secondary);
`;

const BackText = styled(CenterText)`
  font-size: 12px;
`;

const Logo = styled.img`
  height: 20px;
  max-width: 60%;
  object-fit: contain;
  box-sizing: content-box;
`;

const LogoSvg = styled.div`
  height: 20px;
  align-self: center;

  svg {
    height: 20px;
  }
`;

const UpArrow = styled(CpslIcon)`
  transform: rotate(-90deg);

  --icon-color: var(--cpsl-color-text-secondary);
`;

const ExpandedContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex: 1;
  cursor: pointer;
`;
