import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { CpslIcon } from '@usecapsule/react-components';
import { Button } from '../UI';
import { useAtom } from 'jotai';
import { viewAtom } from '../../atoms';
import { createCustomMatchMedia } from '../../utils/matchMedia';
import { mockMobileNavigator, restoreNavigator } from '../../utils/mockMobileNavigator';

interface PreviewControlsProps {}

export const PreviewControls: React.FC<PreviewControlsProps> = () => {
  const [view, setView] = useAtom(viewAtom);
  const originalMatchMediaRef = useRef(window.matchMedia);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Start animation on mount
  }, []);

  const handleDesktopView = () => {
    restoreNavigator();
    window.matchMedia = originalMatchMediaRef.current || window.matchMedia;
    setView('desktop');
  };

  const handleMobileView = async () => {
    await mockMobileNavigator('ios');
    const customMatchMedia = createCustomMatchMedia(480);
    window.matchMedia = customMatchMedia;
    setView('mobile');
  };

  return (
    <ButtonGroup mounted={mounted}>
      <StyledButton variant="ghost" size="medium" $active={view === 'desktop'} onClick={handleDesktopView}>
        <CpslIcon icon="monitor" />
      </StyledButton>
      <StyledButton variant="ghost" size="medium" $active={view === 'mobile'} onClick={handleMobileView}>
        <CpslIcon icon="phone" />
      </StyledButton>
      <StyledButton variant="ghost" size="medium" $active={view === 'code'} onClick={() => setView('code')}>
        <CpslIcon icon="code" />
      </StyledButton>
    </ButtonGroup>
  );
};

const ButtonGroup = styled.div<{ mounted: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  border-radius: 9999px;
  padding: ${({ mounted }) => (mounted ? '0.75rem 1.5rem;' : '0;')};
  gap: 1.5rem;
  background-color: #ffffff;
  overflow: hidden;
  transition: all 0.3s ease-out;
  width: ${({ mounted }) => (mounted ? 'auto' : 0)};
`;

const StyledButton = styled(Button)<{ $active: boolean }>`
  padding: 0;
  cpsl-icon {
    --icon-color: ${({ $active }) => ($active ? 'black' : '#A2A2A2')};
    --width: 1.5rem;
    --height: 1.5rem;
  }
`;
