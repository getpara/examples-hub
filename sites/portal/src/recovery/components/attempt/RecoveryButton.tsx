import { Button, HStack, Text } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import EmailContext from '../../contexts/EmailContext';
import { RecoveryAttemptContext } from '../../contexts/RecoveryAttemptContext';
import RecoveryModal from '../../components/attempt/RecoveryModal';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';
import WalletContext from '../../contexts/WalletContext';
import capsule from '../../../capsule';
import CapsuleSmall from '../../../assets/capsuleSmall';

const RecoveryButton: React.FC = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const { address, setAddress } = useContext(WalletContext);
    const { setEmail } = useContext(EmailContext);
    const { setCurrentStep } = useContext(StepContext);
    const { setStatus, setInitiatedAt } = useContext(RecoveryAttemptContext);
    return (
        <Button
            width={'180px'}
            height={'50px'}
            backgroundColor={'brand.background'}
            color={'white'}
            onClick={async () => {
                if (address) {
                    setEmail(null);
                    setAddress(null);
                    setStatus(null);
                    setInitiatedAt(null);
                    setCurrentStep(ModalStep.EMAIL_COLLECTION);
                    await capsule.logout();
                } else {
                    setModalIsOpen(true);
                }
            }}
        >
            <RecoveryModal onClose={() => setModalIsOpen(false)} isOpen={modalIsOpen} />
            <HStack>
                <Text size="18px" marginRight="9px">
                    {address ? "Logout" : "Manage Recovery"}
                </Text>
            </HStack>
            <CapsuleSmall />
        </Button>
    )
}

export default RecoveryButton;