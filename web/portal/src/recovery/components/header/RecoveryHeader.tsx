import { Box, Flex } from '@chakra-ui/react';
import CapsuleSmall from '../../../library/modal/assets/capsuleSmall';
import Exit from '../../../library/modal/assets/exit';

export function RecoveryHeader({
    step = 0,
    onClose,
}: {
    step?: number;
    onClose: () => void;
}) {
    return (
        <Box height="62px" width="100%">
            <Flex h="57px" w="100%" justifyContent={'center'} alignItems={'center'}>
                <CapsuleSmall w={19} h={32} />
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
                    w="87px"
                    h="5px"
                    borderRadius="8px"
                    backgroundColor={
                        step >= 1 ? 'brand.content' : 'brand.contentSecondary'
                    }
                />
                <Box
                    w="87px"
                    h="5px"
                    borderRadius="8px"
                    backgroundColor={
                        step >= 2 ? 'brand.content' : 'brand.contentSecondary'
                    }
                />
                <Box
                    w="87px"
                    h="5px"
                    borderRadius="8px"
                    backgroundColor={
                        step >= 3 ? 'brand.content' : 'brand.contentSecondary'
                    }
                />
                <Box
                    w="87px"
                    h="5px"
                    borderRadius="8px"
                    backgroundColor={
                        step >= 4 ? 'brand.content' : 'brand.contentSecondary'
                    }
                />
            </Flex>
        </Box>
    );
}
