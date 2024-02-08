import { Button, Image, Tooltip } from '@chakra-ui/react';
import appleLogo from '../public/apple-logo.png';

const AppleAuthComponent = ({width} : {width: number;}) => {
    return (
        // @ts-ignore
        <Tooltip placement='top' label="Coming Soon!" shouldWrapChildren={true}>
            {/* @ts-ignore */}
            <Button
                color="white"
                bg="black"
                border="2px solid"
                borderColor="white"
                padding="10px"
                borderRadius="10px"
                height="50px"
                width={`${width}px`}
                justifyContent="center"
                alignItems="center"
                display="flex"
                isDisabled={true}
                _hover={{ cursor: 'not-allowed' }}
            >
                {/* @ts-ignore */}
                <Image width={10} height={10} src={appleLogo} alt="Apple Logo" />
            </Button>
        </Tooltip>
    );
};

export default AppleAuthComponent;