import { styled } from 'styled-components';
import { CpslButton, CpslIcon } from '@usecapsule/react-components';
import { ButtonWithIconContainer, Heading, SecondaryText } from '../common.js';
import { CAPSULE_CONNECT } from '../../constants/constants.js';
import { useThemeStore } from '../../stores/index.js';

interface FooterProps {
  expandModal: () => void;
}

export const Footer = ({ expandModal }: FooterProps) => {
  const isDark = useThemeStore((state) => state.isDark);

  const handleConnectClick = () => {
    window.open(CAPSULE_CONNECT, '_blank');
  };

  return (
    <>
      <FooterContainer slot="footer">
        <FooterContentContainer>
          <CondensedText>
            Use this account across the web. <ClickableText onClick={expandModal}>Learn More.</ClickableText>
          </CondensedText>
          <PoweredByContainer>
            <CondensedText>
              <span>Powered by</span>
            </CondensedText>
            <CapsuleLogo icon="capsuleLogo" />
          </PoweredByContainer>
        </FooterContentContainer>
      </FooterContainer>
      <FooterContainer slot="footerExpandedFooter">
        <CapsuleIconContainer $isDark={isDark}>
          <LargeCapsuleIcon $isDark={isDark} icon="capsule" />
        </CapsuleIconContainer>
        <FooterContentContainer>
          <Heading>Your Capsule Wallet</Heading>
          <FooterSecondaryText>
            Experience all that Web3 has to offer without any of the confusion. You can use your Capsule wallet across all
            sorts of websites.
            {'\n\n'}Visit Capsule Connect to learn even more.
          </FooterSecondaryText>
          <ConnectButton onClick={handleConnectClick}>
            <ButtonWithIconContainer>
              <CapsuleIcon icon="capsule" />
              Capsule Connect
            </ButtonWithIconContainer>
          </ConnectButton>
        </FooterContentContainer>
      </FooterContainer>
    </>
  );
};

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0px 16px;
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

const CondensedText = styled(SecondaryText)`
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  display: inline-block;
`;

const FooterSecondaryText = styled(SecondaryText)`
  max-width: 315px;
`;

const ClickableText = styled(CondensedText)`
  color: var(--cpsl-color-text-primary);
  cursor: pointer;
  display: inline-block;
`;

const CapsuleLogo = styled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-secondary);
  --width: 65px;
  --height: auto;
`;

const CapsuleIcon = styled(CpslIcon)`
  --width: 20px;
  --height: 20px;
`;

const LargeCapsuleIcon = styled(CpslIcon)<{ $isDark: boolean }>`
  --width: 23px;
  --height: 38px;

  --icon-color: ${({ $isDark }) => ($isDark ? 'black' : 'white')};
`;

const CapsuleIconContainer = styled.div<{ $isDark: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ $isDark }) => ($isDark ? 'white' : 'black')};
`;

const ConnectButton = styled(CpslButton)`
  margin-top: 12px;
`;
