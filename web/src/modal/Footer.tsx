import { Box, Container, Flex } from '@chakra-ui/react';
import PoweredByCapsule from './assets/poweredByCapsule';

export function Footer() {
  return (
    <Box height="62px" width="100%">
      <Flex h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
        <PoweredByCapsule w={50} h={20} />
      </Flex>
    </Box>
  );
}
