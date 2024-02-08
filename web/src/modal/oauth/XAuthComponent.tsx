import React, { Button, Image, Tooltip } from '@chakra-ui/react';
import xLogo from '../public/x-logo.png';

const XAuthComponent = ({width} : {width: number;}) => {
    return (
        <Tooltip placement='top' label="Coming Soon!" shouldWrapChildren={true}>
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
                <Image src={xLogo} alt="X Logo" />
            </Button>
        </Tooltip>
    );
};

export default XAuthComponent;