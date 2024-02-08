import React, { Button, Image, Tooltip } from '@chakra-ui/react';
import discordLogo from '../public/discord-logo.png';

const DiscordAuthComponent = ({width} : {width: number;}) => {
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
                <Image src={discordLogo} alt="Discord Logo" />
            </Button>
        </Tooltip>
    );
};

export default DiscordAuthComponent;