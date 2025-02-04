import { styled } from 'styled-components';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { AuthLoginStep } from '../constants';

interface ModalFooterProps {
  step?: AuthLoginStep;
  setStep?: (step: AuthLoginStep) => void;
}

export const ModalFooter = ({ step, setStep }: ModalFooterProps) => {
  const handleTroubleshootingClick = () => {
    setStep?.(AuthLoginStep.LOGIN_FAILED_TROUBLESHOOTING);
  };

  return (
    <FooterContentContainer>
      <PoweredByContainer>
        <FooterText color="secondary" variant="bodyXS">
          Powered by
        </FooterText>
        <ParaLogo icon="para" />
      </PoweredByContainer>
      {step === AuthLoginStep.LOGIN_FAILED && (
        <ClickableText variant="bodyS" color="contrast" weight="medium" onClick={handleTroubleshootingClick}>
          Troubleshooting
        </ClickableText>
      )}
    </FooterContentContainer>
  );
};

const FooterContentContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 16px;
  padding-bottom: 20px;
  padding-left: 50px;
  padding-right: 50px;
  border-top: 1px solid var(--cpsl-color-background-4);
`;

const PoweredByContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const FooterText = styled(CpslText)`
  text-align: center;
  white-space: pre-line;
`;

const ParaLogo = styled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-secondary);
  --width: 45px;
  --height: auto;
`;

const ClickableText = styled(CpslText)`
  cursor: pointer;
  text-decoration: underline;
`;
