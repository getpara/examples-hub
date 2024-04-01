import { CpslButton, CpslIcon, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { ModalStep } from '../../utils/steps';
import { useModalStore } from '../../stores';
import { useThemeStore } from '../../stores/theme/useThemeStore';
import { Theme } from '../../types/theme';
import { CapsuleBlack, CapsuleWhite } from '../Icons';

interface HeaderProps {
  onClose: () => void;
}

export const Header = ({ onClose }: HeaderProps) => {
  const logo = useThemeStore((state) => state.getLogo());
  const theme = useThemeStore((state) => state.theme);
  const appName = useThemeStore((state) => state.appName);
  const currentStep = useModalStore((state) => state.step);
  const decrementStep = useModalStore((state) => state.decrementStep);
  const hasPreviousStep = useModalStore((state) => state.hasPreviousStep());
  const resetState = useModalStore((state) => state.resetState);

  const handleBackClick = () => {
    decrementStep();
    switch (currentStep) {
      case ModalStep.VERIFY_2FA:
      case ModalStep.BIOMETRIC_CREATION:
      case ModalStep.BIOMETRIC_LOGIN: {
        resetState();
        break;
      }
    }
  };

  return (
    <Container slot="header">
      <BackButton
        variant="icon"
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
              <LogoSvg>
                {theme === Theme.dark ? <CapsuleWhite /> : <CapsuleBlack />}
              </LogoSvg>
            )}
          </>
        )}
      </CenterTextContainer>
      <HeaderButton variant="icon" onClick={onClose}>
        <CpslIcon icon="close" />
      </HeaderButton>
    </Container>
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
