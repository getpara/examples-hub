import { Button, Text } from '@chakra-ui/react';
import { useState } from 'react';
import CapsuleSmall from '../../../library/modal/assets/capsuleSmall';
import RecoveryCancelModal from './RecoveryCancelModal';

const RecoveryCancelButton: React.FC = () => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    return (
        <Button
            width={'180px'}
            height={'50px'}
            backgroundColor={'brand.background'}
            color={'white'}
            display='flex'
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