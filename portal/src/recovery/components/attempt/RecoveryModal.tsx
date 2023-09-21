import { Modal, ModalOverlay, ModalContent, ModalBody, VStack } from '@chakra-ui/react'
import { useContext } from 'react'
import { Footer } from '../../../library/modal/Footer'
import RecoveryEmailCollectionStep from './RecoveryEmailCollectionStep'
import { RecoveryHeader } from '../header/RecoveryHeader'
import RecoveryLost2FA from '../../components//RecoveryLost2FAStep'
import StepContext from '../../contexts/StepContext'
import { ModalStep, ModalStepNumber } from '../../steps/attemptSteps'
import Recovery2FAStep from './Recovery2FAStep'
import RecoveryAwaitingInitiationStep from './RecoveryAwaitingInitiationStep'
import RecoveryInitiatedDoneStep from './RecoveryInitiatedDoneStep'
import RecoveryVerificationCodeStep from './RecoveryVerificationCodeStep'

type RecoveryModalProps = {
    isOpen: boolean,
    onClose: () => void,
};

const RecoveryModal: React.FC<RecoveryModalProps> = ({ isOpen, onClose }) => {

    const { currentStep } = useContext(StepContext);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                backgroundColor={'brand.background'}
                width="356px"
                height="632px"
            >
                <ModalBody padding={0} display="flex" flexDirection="column">
                    <RecoveryHeader step={ModalStepNumber[currentStep]} onClose={onClose} />
                    <VStack
                        alignItems="center"
                        display="flex"
                        flex={1}
                        margin="22px 22px 0px"
                    >
                        {currentStep === ModalStep.EMAIL_COLLECTION && <RecoveryEmailCollectionStep />}
                        {currentStep === ModalStep.VERIFICATION_CODE && <RecoveryVerificationCodeStep onClose={onClose} />}
                        {currentStep === ModalStep.VERIFY_2FA && <Recovery2FAStep />}
                        {currentStep === ModalStep.RECOVERY_AWAITING && <RecoveryAwaitingInitiationStep />}
                        {currentStep === ModalStep.RECOVERY_INITIATED && <RecoveryInitiatedDoneStep onClose={onClose} />}
                        {currentStep === ModalStep.LOST_2FA && <RecoveryLost2FA onClose={onClose} />}
                    </VStack>
                    <Footer />
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default RecoveryModal