import { Box, Flex, Text, Button, Modal, ModalBody, ModalContent, ModalOverlay, Spacer, VStack } from '@chakra-ui/react';
import { CapsuleSmall, Console, Exit, Footer } from '@usecapsule/react-sdk';
import capsule from '../../../capsule';
import { useContext } from 'react';
import EmailContext from '../../contexts/EmailContext';
import { ModalStep as RecoveryModalStep } from '../../steps/recoverySteps';
import { ModalStep } from '../../steps/attemptSteps';
import RecoveryStepContext from '../../contexts/RecoveryStepContext';
import WalletContext from '../../contexts/WalletContext';
import StepContext from '../../contexts/StepContext';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';

type RecoveryCancelModalProps = {
    isOpen: boolean,
    onClose: () => void,
};

const RecoveryCancelModal: React.FC<RecoveryCancelModalProps> = ({ isOpen, onClose }) => {

    const { email, setEmail } = useContext(EmailContext);
    const { setCurrentStep } = useContext(StepContext);
    const { setCurrentRecoveryStep } = useContext(RecoveryStepContext);
    const { setAddress } = useContext(WalletContext);
    const { setStatus, setInitiatedAt } = useContext(RecoveryAttemptContext);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                backgroundColor={'brand.background'}
                width="356px"
                height="632px"
            >
                <ModalBody padding={0} display="flex" flexDirection="column">
                    <VStack
                        alignItems="center"
                        display="flex"
                        flex={1}
                        margin="22px 22px 0px"
                    >
                        <Box height="62px" width="100%" marginBottom={12}>
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
                                    w="348px"
                                    h="5px"
                                    borderRadius="8px"
                                    backgroundColor={'brand.content'}
                                />
                            </Flex>
                        </Box>
                        <Text fontSize="l">Cancel Recovery</Text>
                        <Console />
                        <Text
                            fontSize="md"
                            paddingTop="8"
                            align="center"
                        >
                            Are you sure you want to cancel your recovery attempt?
                        </Text>
                        <Text
                            fontSize='md'
                            align='center'
                            paddingTop="4"
                        >
                            This action cannot be undone.
                        </Text>
                        <Spacer />
                        <Button
                            width="100%"
                            onClick={async () => {
                                setCurrentStep(ModalStep.EMAIL_COLLECTION);
                                setCurrentRecoveryStep(RecoveryModalStep.VERIFY_2FA);
                                setAddress(null);
                                await capsule.ctx.capsuleClient.cancelRecoveryAttempt(email);
                                setEmail(null);
                                setStatus(null);
                                setInitiatedAt(null);
                                onClose();
                            }}
                            backgroundColor="red.600"
                            color="brand.content"
                        >
                            Cancel
                        </Button>
                    </VStack>
                    <Footer />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}


export default RecoveryCancelModal