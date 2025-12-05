import { styled } from 'styled-components';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { HeaderButton } from '@getpara/react-common';
import { AuthLoginStep, ENV } from '../../../constants';
import { getPortalBaseURL } from '@getpara/web-sdk';

interface LoginFailedTroubleshootingStepProps {
  setStep: (step: AuthLoginStep) => void;
}

export const LoginFailedTroubleshootingStep = ({ setStep }: LoginFailedTroubleshootingStepProps) => {
  const handleBackClick = () => {
    setStep(AuthLoginStep.LOGIN_FAILED);
  };

  return (
    <Container>
      <BackContainer>
        <BackButton variant="ghost" onClick={handleBackClick}>
          <CpslIcon icon="arrow" />
        </BackButton>
        <CpslText variant="bodyS" weight="medium" color="contrast">
          Back to Login
        </CpslText>
      </BackContainer>
      <HeaderContainer>
        <CpslText weight="semiBold" variant="headingXS" color="contrast">
          Troubleshooting
        </CpslText>
        <CpslText variant="bodyS" color="secondary" weight="medium">
          If your are having trouble logging into your Para account, please try the following.
        </CpslText>
      </HeaderContainer>
      <ListText variant="bodyS" color="contrast" weight="medium">
        {`• If you use a password manager, please make sure it is enabled. 

        • Check that your passkey syncing for iCloud, Chrome, or Password Manager settings is enabled if you are using multiple devices. 
       
        • On desktop, make sure you are using the correct browser, and profile within that browser.

        • If you are using a Chromium-based browser (eg. Arc), the passkey may show up labeled Chrome instead of your specific browser.
       
        • On mobile, if you initially set up your passkey in an app browser (eg Telegram), you may need to use the default browser in that app to log in.`}
      </ListText>
      <InlineText variant="bodyS" color="contrast" weight="medium">
        If you think you have lost your Passkey, you can register a new one using the{' '}
        <a href={getPortalBaseURL({ env: ENV }, false, false, true)} target="_blank">
          <RecoveryText variant="bodyS" color="contrast" weight="medium">
            Recovery Portal
          </RecoveryText>
        </a>
        .
      </InlineText>
      <InlineText variant="bodyS" color="contrast" weight="medium">
        If you are still having issues, please get in touch at{' '}
        <a href="mailto:support@getpara.com" target="_blank">
          <InlineText variant="bodyS" color="contrast" weight="medium">
            support@getpara.com
          </InlineText>
        </a>
        .
      </InlineText>
    </Container>
  );
};

const Container = styled.div`
  margin-top: -8px;
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BackContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BackButton = styled(HeaderButton)`
  transform: rotate(180deg);
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InlineText = styled(CpslText)`
  display: inline-block;
`;

const RecoveryText = styled(InlineText)`
  text-decoration: underline;
  cursor: pointer;
`;

const ListText = styled(CpslText)`
  white-space: pre-line;
`;
