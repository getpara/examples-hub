import { Box, Button, Text } from '@chakra-ui/react';
import WalletSuccess from './assets/walletSuccess';

export function Done2FAStep({
    onClose,
}: {
    onClose: () => void;
}) {

    return (
        <Box
            flexDirection="column"
            display="flex"
            justifyContent="space-between"
            flex={1}
            alignItems="space-between"
        >
            <Box display="flex" flexDirection="column" flex={1} alignItems="center">
                <Text fontSize="l">2FA Setup!</Text>
                <WalletSuccess />
                <Text textAlign="center" fontSize="l" marginTop="22px">
                    Success!
                </Text>
                <Text textAlign="center" marginTop="4px" w="90%" fontSize="s">
                    You have successfully setup 2-factor authentication
                </Text>
            </Box>
            <Button w="100%" h="44px" onClick={onClose}>
                Close
            </Button>
        </Box>
    );
}
