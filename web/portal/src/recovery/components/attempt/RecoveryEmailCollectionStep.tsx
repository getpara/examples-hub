import { VStack, Spacer, HStack, Input, Button, Text, Box } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import capsule from '../../../capsule';
import Plus from '../../../library/modal/assets/plus';
import WalletCreation from '../../../library/modal/assets/walletCreation';
import EmailContext from '../../contexts/EmailContext';
import StepContext from '../../contexts/StepContext';
import { ModalStep } from '../../steps/attemptSteps';

const RecoveryEmailCollectionStep: React.FC = () => {

    const { setCurrentStep } = useContext(StepContext);
    const { setEmail } = useContext(EmailContext);
    const [userDoesNotExist, setUserDoesNotExist] = useState(false);
    const [inputEmail, setInputEmail] = useState(null);

    return (
        <VStack alignItems="center" display="flex" flex={1}>
            <WalletCreation />
            <Text textColor="brand.text" fontSize="ml">
                Initiate recovery
            </Text>
            <Text textColor="brand.text" fontSize="ml" textAlign="center">
                First, enter your email
            </Text>
            <Spacer />
            <HStack alignItems="start">
                <Box marginTop="6px">
                    <Plus />
                </Box>
                <Box>
                    <Text textColor="brand.content" fontSize="m">
                        Enter email
                    </Text>
                    <Text textColor="brand.content" fontSize="s">
                        We'll need this to know what account you're initiating recovery for
                    </Text>
                </Box>
            </HStack>

            <Spacer />
            <Input
                placeholder="Email"
                isInvalid={userDoesNotExist}
                type="email"
                borderColor="brand.frameColor"
                textColor="brand.text"
                background="rgba(255, 255, 255, 0.05)"
                border="1px solid rgba(255, 255, 255, 0.1)"
                borderRadius="5px"
                focusBorderColor="brand.text"
                onChange={async (e) => {
                    const em = e.target.value;
                    setInputEmail(em);
                }}
                value={inputEmail || ''}
            />
            {userDoesNotExist && <Text alignSelf="flex-start" color="red.500" fontSize="x-small">This user does not exist with Capsule</Text>}
            <Box flex={1} height="40px" />
            <Button
                width="100%"
                onClick={async () => {
                    if (!inputEmail) {
                        throw new Error('email is required');
                    }
                    capsule.clearStorage();

                    const userExists = await capsule.checkIfUserExists(inputEmail);
                    if (userExists) {
                        setEmail(inputEmail);
                        setCurrentStep(ModalStep.VERIFICATION_CODE);
                        await capsule.ctx.capsuleClient.initializeRecovery(inputEmail);
                    } else {
                        setUserDoesNotExist(true);
                    }
                }}
            >
                Continue
            </Button>
        </VStack>
    )
}

export default RecoveryEmailCollectionStep;