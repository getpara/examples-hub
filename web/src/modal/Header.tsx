import { Box, Flex } from '@chakra-ui/react';
import HeaderLogo from './assets/headerLogo';
import React from 'react';
import Exit from './assets/exit';

export function Header({
  step = 0,
  logoUrl,
  onClose,
}: {
  step?: number;
  logoUrl?: string;
  onClose: () => void;
}) {
  return (
    <Box height="62px" width="100%">
      {/* @ts-ignore */}
      <Flex h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
        <HeaderLogo h={32} url={logoUrl}/>
        <Box
          cursor="pointer"
          onClick={onClose}
          position="absolute"
          right="12px"
        >
          <Exit />
        </Box>
      </Flex>
      <Flex
        display="flex"
        flexDirection="row"
        w="100%"
        justifyContent="space-between"
      >
        <Box
          w="70px"
          h="5px"
          borderRadius="8px"
          backgroundColor={
            step >= 1 ? 'brand.button' : 'brand.contentSecondary'
          }
        />
        <Box
          w="70px"
          h="5px"
          borderRadius="8px"
          backgroundColor={
            step >= 2 ? 'brand.button' : 'brand.contentSecondary'
          }
        />
        <Box
          w="70px"
          h="5px"
          borderRadius="8px"
          backgroundColor={
            step >= 3 ? 'brand.button' : 'brand.contentSecondary'
          }
        />
        <Box
          w="70px"
          h="5px"
          borderRadius="8px"
          backgroundColor={
            step >= 4 ? 'brand.button' : 'brand.contentSecondary'
          }
        />
        <Box
          w="70px"
          h="5px"
          borderRadius="8px"
          backgroundColor={
            step >= 5 ? 'brand.button' : 'brand.contentSecondary'
          }
        />
      </Flex>
    </Box>
  );
}
