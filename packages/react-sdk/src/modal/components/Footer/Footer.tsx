import styled from 'styled-components';
import { CpslIcon, CpslText } from '@usecapsule/react-components';

export const Footer = () => {
  return (
    <FooterContainer slot="footer">
      <SecondaryText>
        <span>Powered by</span>
        <CapsuleLogo icon="capsuleLogo" />
      </SecondaryText>
    </FooterContainer>
  );
};

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Text = styled(CpslText)`
  display: flex;
  gap: 5px;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  white-space: pre-line;
`;

const SecondaryText = styled(Text)`
  color: var(--cpsl-color-text-secondary);
`;

const CapsuleLogo = styled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-secondary);
  --width: 65px;
  --height: auto;
`;
