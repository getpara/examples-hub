import { VStack, Spacer, Text, Button, Box } from '@chakra-ui/react'
import WalletSuccess from '../../assets/walletSuccess';

type RecoveryLost2FAProps = {
    onClose: () => void,
};

const RecoveryLost2FA: React.FC<RecoveryLost2FAProps> = ({ onClose }) => {
    return (
        <VStack flex={1}>
            <Text fontSize="l">Manual Assistance Required</Text>
            <WalletSuccess />
            <Text
                fontSize="md"
                paddingTop="8"
                align="center"
            >
                Please contact
                <Box
                    as='a'
                    href='mailto:support@usecapsule.com'
                    cursor="pointer"
                    fontWeight="bold"
                    _hover={{ textDecoration: "underline" }}
                >
                    <> support@usecapsule.com </>
                </Box>
                for further assistance recovering your account
            </Text>
            <Spacer />
            <Button
                width="100%"
                onClick={onClose}
            >
                Close
            </Button>
        </VStack>
    )
}

export default RecoveryLost2FA;