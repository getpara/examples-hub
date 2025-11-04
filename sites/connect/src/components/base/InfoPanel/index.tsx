import React from 'react';
import { Flex } from 'rebass';

import * as Styled from './styles';
import useIsMobile from '@/hooks/MobileContext';

interface InfoPanelProps {
  children: React.ReactNode;
}

const InfoPanel = ({ children }: InfoPanelProps) => {
  const isMobile = useIsMobile();

  return (
    <Styled.Container isMobile={isMobile}>
      <Flex pt="48px" pr={isMobile ? '10px' : '48px'} pb="48px" pl={isMobile ? '10px' : '48px'}>
        {children}
      </Flex>
    </Styled.Container>
  );
};

export default InfoPanel;
