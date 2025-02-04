import { Box, Flex } from '@chakra-ui/react';
import PoweredByPara from '../../../assets/poweredByPara';

export function Footer() {
  return (
    <Box height="62px" width="100%">
      <Flex h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
        <PoweredByPara />
      </Flex>
    </Box>
  );
}
