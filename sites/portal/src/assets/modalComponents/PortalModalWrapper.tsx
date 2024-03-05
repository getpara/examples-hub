import { Box, ChakraProvider, Container, Flex, Theme } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import BetaBanner from '../../BetaBanner';
import { getPartnerTheme } from '../../theme';
import PoweredByCapsule from '../poweredByCapsule';

interface BasePortalModalWrapperProps extends PropsWithChildren {
  paramsPartnerId?: string;
}

interface WithTheme {
  theme: Theme;
  portalBackgroundColor?: never;
  portalPrimaryButtonColor?: never;
  portalTextColor?: never;
}

interface WithoutTheme {
  theme?: never;
  portalBackgroundColor: string;
  portalPrimaryButtonColor: string;
  portalTextColor: string;
}

type PortalModalWrapperProps = BasePortalModalWrapperProps &
  (WithTheme | WithoutTheme);

export const PortalModalWrapper = ({
  theme,
  portalBackgroundColor,
  portalPrimaryButtonColor,
  portalTextColor,
  paramsPartnerId,
  children,
}: PortalModalWrapperProps) => {
  return (
    <ChakraProvider
      theme={
        theme ??
        getPartnerTheme(
          portalBackgroundColor,
          portalPrimaryButtonColor,
          portalTextColor,
        )
      }
    >
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
      />
      <Container
        textColor={portalTextColor}
        color={portalBackgroundColor}
        padding={0}
        minHeight="100%"
        minWidth="100%"
      >
        <BetaBanner />
        <Container padding={4} display="flex" flexDirection="column" gap={4}>
          {children}
        </Container>
      </Container>
      {paramsPartnerId && (
        <Box backgroundColor={portalBackgroundColor} height="62px" width="100%">
          <Flex
            backgroundColor={portalBackgroundColor}
            h="57px"
            w="100%"
            justifyContent={'center'}
            alignItems={'center'}
          >
            <PoweredByCapsule color={portalTextColor} w={50} h={20} />
          </Flex>
        </Box>
      )}
    </ChakraProvider>
  );
};
