import { styled } from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { Text } from './common';

export const ModalFooter = () => {
  return (
    <FooterContentContainer>
      <FooterText>
        <span>
          Use this account across the web.{' '}
          <ClickableText>
            <span>Learn More.</span>
          </ClickableText>
        </span>
      </FooterText>
      <PoweredByContainer>
        <FooterText>
          <span>Powered by</span>
        </FooterText>
        <CapsuleLogo icon="capsuleLogo" />
      </PoweredByContainer>
    </FooterContentContainer>
  );
};

const FooterContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 8px;
  padding-bottom: 24px;
`;

const PoweredByContainer = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const FooterText = styled(Text)`
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-line;
`;

const ClickableText = styled(FooterText)`
  &::part(text-element) {
    color: var(--cpsl-color-text-primary);
  }
  cursor: pointer;
`;

const CapsuleLogo = styled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-secondary);
  --width: 65px;
  --height: auto;
`;
