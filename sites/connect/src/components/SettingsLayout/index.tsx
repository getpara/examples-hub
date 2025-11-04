import { ReactNode, useEffect } from 'react';
import useMobile from '@/hooks/MobileContext';

import * as Styled from './styles';
import { Flex } from 'rebass';
import { useRouter } from 'next/router';
import { useClient } from '@getpara/react-sdk';

/**
 * Types
 */
interface Props {
  children: ReactNode | ReactNode[];
}

/**
 * Container
 */
export default function SettingsLayout({ children }: Props) {
  const router = useRouter();
  const isMobile = useMobile();
  const para = useClient();

  useEffect(() => {
    const loadCapsuleModule = async () => {
      if (!para) return;

      const isLoggedIn = await para.isFullyLoggedIn();

      if (!isLoggedIn) {
        router.replace('/');
      }
    };

    loadCapsuleModule();
  }, []);

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      pl={isMobile ? '15px' : '75px'}
      pr={isMobile ? '15px' : '75px'}
      pb="40px"
    >
      <Flex flexDirection="column" alignItems="center">
        <Styled.HeaderText>Settings</Styled.HeaderText>
        {children}
      </Flex>
    </Flex>
  );
}
