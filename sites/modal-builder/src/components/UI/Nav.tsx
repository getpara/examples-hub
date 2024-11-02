import React from 'react';
import styled from 'styled-components';
import { Button } from './StyledButton';
import { CpslIcon } from '@usecapsule/react-components';
import { Text } from './StyledText';
import { CapsuleLogo } from '../../assets';

export const NavBar: React.FC = () => {
  return (
    <NavWrapper>
      <Logo src={CapsuleLogo} alt="Capsule Logo" />
      <NavButtons>
        <GradientButton>
          <StyledButton
            variant="secondary"
            onClick={() => window.open('https://usecapsule.com/talk-to-us', '_blank')}
            size="small"
          >
            <Text variant="bodyS" weight="medium" color="primary">
              Still have questions?
              <StyledSpan>Talk to us!</StyledSpan>
            </Text>
          </StyledButton>
        </GradientButton>
        <Button variant="secondary" onClick={() => window.open('https://developer.usecapsule.com/', '_blank')} size="small">
          <ButtonContent>
            <Text variant="bodyS" weight="medium" color="primary">
              Developer Portal
            </Text>
            <ButtonIcon icon="linkExternal" />
          </ButtonContent>
        </Button>{' '}
      </NavButtons>
    </NavWrapper>
  );
};

const NavWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  background-color: white;
  z-index: 1000;
  position: relative;
`;

const Logo = styled.img`
  height: 2rem;
`;

const NavButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

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

const StyledSpan = styled.span`
  margin-left: 0.5rem;
  text-decoration: underline;
`;

const StyledButton = styled(Button)`
  border: none;
  border-radius: calc(0.75rem - 1px);
  transition: all 0.3s ease;
  &:hover {
    background: none;
    box-shadow: none;
    p {
      color: #ffffff;
      transition: all 0.3s ease;
    }
  }
`;

const GradientButton = styled.div`
  background: linear-gradient(90deg, #ff754a 0%, #9c1eff 100%);
  border-radius: 0.75rem;
  padding: 1px;

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
