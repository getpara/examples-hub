import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { Text } from './StyledText';
import { Button } from './StyledButton';
import { Card } from './StyledCard';
import { useAtom } from 'jotai';
import { capsuleClientAtom, checkLoginStatusAtom, copyShareUrlAtom, getCodeStringAtom, resetConfigAtom } from '../../atoms';

export const AnnouncementBanner: React.FC = () => {
  const [capsuleClient] = useAtom(capsuleClientAtom);
  const [, checkLoginStatus] = useAtom(checkLoginStatusAtom);
  const [, resetConfig] = useAtom(resetConfigAtom);
  const [getCodeString] = useAtom(getCodeStringAtom);
  const [, copyShareUrl] = useAtom(copyShareUrlAtom);

  const [copyButtonText, setCopyButtonText] = React.useState('Copy Code');

  const [shareButtonText, setShareButtonText] = React.useState('Share');

  const handleLogout = async () => {
    try {
      await capsuleClient.logout();
      checkLoginStatus(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleReset = async () => {
    try {
      resetConfig(null);
      await handleLogout();
    } catch (error) {
      console.error('Error resetting config:', error);
    }
  };

  const handleCopy = async () => {
    const code = getCodeString;
    await navigator.clipboard.writeText(code);
    setCopyButtonText('Copied');
    setTimeout(() => {
      setCopyButtonText('Copy Code');
    }, 1500);
  };

  const handleShare = () => {
    copyShareUrl(null);
    setShareButtonText('Copied');
    setTimeout(() => {
      setShareButtonText('Share');
    }, 1500);
  };

  return (
    <AnimatedCard>
      <ContentWrapper>
        <TitleDescriptionWrapper>
          <TitleText variant="headingXS" weight="semiBold" color="primary">
            Modal Designer
          </TitleText>
          <DescriptionText variant="bodyM" weight="regular" color="secondary">
            Configure your modal below then copy your code and paste it into your project.
          </DescriptionText>
        </TitleDescriptionWrapper>
        <ButtonGroup>
          <ActionButton variant="primary" onClick={handleCopy} size="small">
            <ButtonContent>
              <WhiteButtonIcon icon="copy" />
              <Text variant="bodyS" weight="medium" color="inverted">
                {copyButtonText}
              </Text>
            </ButtonContent>
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleShare} size="small">
            <ButtonContent>
              <ButtonIcon icon="share" />
              <Text variant="bodyS" weight="medium">
                {shareButtonText}
              </Text>
            </ButtonContent>
          </ActionButton>
          <ActionButton variant="secondary" onClick={handleReset} size="small">
            <ButtonContent>
              <ButtonIcon icon="refresh" />
              <Text variant="bodyS" weight="medium">
                Reset
              </Text>
            </ButtonContent>
          </ActionButton>
        </ButtonGroup>
        <GradientBanner href="https://developer.usecapsule.com/" target="_blank">
          <BannerIcon
            icon="stars"
            style={{
              alignSelf: 'flex-start',
              marginTop: '0.25rem',
            }}
          />
          <BannerTextGroup>
            <BannerText variant="bodyM" weight="semiBold" color="inverted">
              Ready to get started?
            </BannerText>
            <BannerText variant="bodyXS" weight="medium" color="inverted">
              Customize passkeys, emails, and more in the Developer Portal.
            </BannerText>
          </BannerTextGroup>
          <BannerIcon id="chevron" icon="chevronRight" />
        </GradientBanner>
      </ContentWrapper>
    </AnimatedCard>
  );
};

const slideIn = keyframes`
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const AnimatedCard = styled(Card)`
  animation: ${slideIn} 0.3s ease-in-out forwards;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GradientBanner = styled.a`
  background: linear-gradient(90deg, #ff754a 0%, #9c1eff 100%);
  border-radius: 0.75rem;
  gap: 0.25rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  width: 100%;
  text-decoration: none;

  background-size: 200% 200%;
  background-position: 0% 50%;
  transition: background-position 2s ease; /* Smooth transition on hover-out */

  &:hover {
    background: linear-gradient(90deg, #ff754a 0%, #9c1eff 100%);
    background-size: 200% 200%;
    animation: gradient 2s linear infinite;
  }

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const BannerTextGroup = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
`;

const BannerIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #ffffff;
`;

const BannerText = styled(Text)`
  color: #ffffff;
`;

const TitleDescriptionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TitleText = styled(Text)``;

const DescriptionText = styled(Text)``;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
`;

const ActionButton = styled(Button)``;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #000000;
`;

const WhiteButtonIcon = styled(CpslIcon)`
  --width: 1rem;
  --height: 1rem;
  --icon-color: #ffffff;
`;
