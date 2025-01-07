import { CapsuleModal, OAuthMethod } from '@usecapsule/react-sdk';
import { capsule } from '../../../clients/capsule';
import styled from 'styled-components';
import { capsuleLogo } from '../../../aasets/capsuleLogo';
import { CenteredText, UnderlinedText } from '../../../components/common';
import { GradientCTAButton } from '../../../components/GradientCTAButton/GradientCTAButton';
import { CpslIcon, CpslText } from '@usecapsule/react-components';
import { ON_RAMP_DOCS_LINK, PRIVACY_POLICY, TOS } from '../../../utils/constants';

interface MainProps {
  setIsLoading: (v: boolean) => void;
}

export const Main = ({ setIsLoading }: MainProps) => {
  const handleModalClose = () => {
    setIsLoading(true);
  };

  return (
    <>
      <HeadingContainer>
        <CenteredText variant="headingM" weight="semiBold">
          Capsule Developer Portal
        </CenteredText>
        <CenteredText variant="bodyS" weight="medium" color="tertiary">
          Customize, manage, and see analytics for your Capsule instance.
        </CenteredText>
      </HeadingContainer>
      <a style={{ width: '100%' }} href={ON_RAMP_DOCS_LINK} target="_blank">
        <GradientCTAButton fullWidth icon="stars01Filled" iconSize={16} gap={4}>
          <ButtonInnerContainer>
            <CpslText variant="bodyS" weight="semiBold" color="inverted">
              Now with On and Off Ramps
            </CpslText>
            <LearnMoreContainer>
              <CpslText variant="bodyS" weight="semiBold" color="inverted">
                Learn More
              </CpslText>
              <StyledIcon icon="chevronRight" />
            </LearnMoreContainer>
          </ButtonInnerContainer>
        </GradientCTAButton>
      </a>
      <StyledModal
        capsule={capsule}
        isOpen
        onClose={handleModalClose}
        bareModal
        oAuthMethods={[OAuthMethod.GOOGLE]}
        disablePhoneLogin
        logo={capsuleLogo}
      />
      <FooterContainer>
        <CpslText variant="bodyS" color="tertiary">
          © {new Date().getFullYear()} Capsule Labs, Inc.
        </CpslText>
        <UnderlinedText variant="bodyS" color="tertiary">
          <a href={TOS} target="_blank">
            Terms and Conditions
          </a>
        </UnderlinedText>
        <UnderlinedText variant="bodyS" color="tertiary">
          <a href={PRIVACY_POLICY} target="_blank">
            Privacy Policy
          </a>
        </UnderlinedText>
      </FooterContainer>
    </>
  );
};

const ButtonInnerContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
`;

const HeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FooterContainer = styled.div`
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LearnMoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StyledIcon = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-inverted);
  --height: 20px;
  --width: 20px;
`;

const StyledModal = styled(CapsuleModal)`
  --card-box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.05), 0px 4px 6px 0px rgba(34, 42, 53, 0.04),
    0px 24px 68px 0px rgba(47, 48, 55, 0.05), 0px 2px 3px 0px rgba(0, 0, 0, 0.04);

  &::part(modal-container) {
    overflow: visible;
  }

  &::part(modal-body-card) {
    --card-border-width: 0px;
  }

  &::part(modal-mobile-footer) {
    display: none;
  }

  &::part(modal-footer) {
    display: none;
  }
`;
