import { styled } from 'styled-components';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { PARA_CONNECT, PARA_TERMS_AND_CONDITIONS } from '../../constants/constants.js';
import { useMemo } from 'react';
import { getStepHasFooter } from '../../utils/steps.js';

export const Footer = () => {
  const isAccount = useModalStore(state => state.isAccount());
  const currentStep = useModalStore(state => state.step);

  const showFooter = isAccount || getStepHasFooter(currentStep);

  const Content = useMemo(() => {
    if (isAccount) {
      return (
        <ConnectContainer>
          <ConnectText variant="bodyS" color="secondary" weight="medium">
            Access all your wallet’s features at{' '}
            <a href={PARA_CONNECT} target="blank">
              <ClickableText variant="bodyS" weight="medium">
                Para Connect
              </ClickableText>
            </a>
          </ConnectText>
          <CpslButton as="a" href={PARA_CONNECT} target="blank" variant="ghost">
            <RightChevron icon="chevronUp" />
          </CpslButton>
        </ConnectContainer>
      );
    }

    return (
      <>
        <InlineText variant="body2XS" color="secondary" weight="medium">
          By logging in you agree to our{' '}
          <a href={PARA_TERMS_AND_CONDITIONS} target="blank">
            <ClickableText variant="body2XS" weight="medium">
              Terms & Conditions
            </ClickableText>
          </a>
        </InlineText>
        <PoweredByContainer>
          <InlineText variant="bodyS" color="secondary" weight="medium">
            Powered by
          </InlineText>
          <ParaLogo icon="para" />
        </PoweredByContainer>
      </>
    );
  }, [isAccount]);

  if (!showFooter) {
    return null;
  }

  return (
    <FooterContainer slot="footer">
      <FooterContentContainer>{Content}</FooterContentContainer>
    </FooterContainer>
  );
};

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0px;
`;

const FooterContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const PoweredByContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const ConnectContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const RightChevron = styled(CpslIcon)`
  transform: rotate(90deg);

  /* --icon-color: var(--cpsl-color-text-tertiary); */
  --height: 24px;
  --width: 24px;
`;

const InlineText = styled(CpslText)`
  text-align: center;
  display: inline-block;
`;

const ConnectText = styled(InlineText)`
  line-height: 20px;
`;

const ClickableText = styled(InlineText)`
  cursor: pointer;
  display: inline-block;
`;

const ParaLogo = styled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-secondary);
  --width: 49px;
  --height: auto;
`;
