import React from 'react';
import { Flex } from 'rebass';

import * as Styled from './styles';
import useIsMobile from '@/hooks/MobileContext';

interface BottomNavProps {
  handleOpenDrawer: () => void;
  instructionPanelOpenState: boolean;
}

const BottomNav = ({ handleOpenDrawer, instructionPanelOpenState }: BottomNavProps) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <Styled.Container>
      {!instructionPanelOpenState && (
        <Styled.DrawerButton onClick={handleOpenDrawer}>
          <Styled.ChevronUp />
          Open Instructions
        </Styled.DrawerButton>
      )}
    </Styled.Container>
  ) : (
    <Styled.Container>
      <Flex flex={1} />
      <Flex flex={1} justifyContent="center">
        {!instructionPanelOpenState && (
          <Styled.DrawerButton onClick={handleOpenDrawer}>
            <Styled.ChevronUp />
            Open Instructions
          </Styled.DrawerButton>
        )}
      </Flex>
      <Flex flex={1} justifyContent="flex-end" alignItems="center" pb="10px" pr="10px">
        <Styled.Link onClick={() => window.open('https://www.getpara.com', '_blank')}>Learn more about Para</Styled.Link>
        <Styled.RightArrow />
      </Flex>
    </Styled.Container>
  );
};

export default BottomNav;
