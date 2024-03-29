import { Button, Text } from '@chakra-ui/react';
import { useState } from 'react';
import RecoveryCancelModal from './RecoveryCancelModal';
import CapsuleSmall from '../../../assets/capsuleSmall';

const RecoveryCancelButton: React.FC = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    return (
        <Button
            width={'180px'}
            height={'50px'}
            backgroundColor={'brand.background'}
            color={'white'}
            onClick={async () => {
                setModalIsOpen(true)
            }}
        >
            <RecoveryCancelModal onClose={() => setModalIsOpen(false)} isOpen={modalIsOpen} />
            <Text size="18px" marginRight="9px">
                Cancel Recovery
            </Text>
            <CapsuleSmall />
        </Button>
    )
}

export default RecoveryCancelButton;