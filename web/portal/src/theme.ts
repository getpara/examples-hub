import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  initialColorMode: 'dark',
  useSystemColorMode: false,
  styles: {
    global: {
      // styles for the `body`
      body: {
        bg: 'gray.400',
        color: 'white',
      },
      // styles for the `a`
      a: {
        color: 'teal.500',
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
});

export function getPartnerTheme(portalBackgroundColor: string | undefined, portalPrimaryButtonColor: string | undefined, portalTextColor: string | undefined): Record<string, any> {
  return extendTheme({
    useSystemColorMode: true,
    components: {
      Button: portalPrimaryButtonColor ? {
        baseStyle: {
          bg: portalPrimaryButtonColor,
          color: portalTextColor,
        },
        defaultProps: {
          variant: 'nested',
        },
      } : {},
      Container: portalBackgroundColor ? {
        baseStyle: {
          bg: portalBackgroundColor,
        },
      } : {},
      Heading: portalTextColor ? {
        baseStyle: {
          color: portalTextColor,
        },
      } : {},
      Text: portalTextColor ? {
        baseStyle: {
          color: portalTextColor,
        },
        defaultProps: {
          variant: 'nested',
        },
      } : {},
      Flex: portalBackgroundColor ? {
        baseStyle: {
          backgroundColor: portalBackgroundColor,
        },
        defaultProps: {
          variant: 'nested',
        },
      } : {},
    },
    styles: {
      global: {
        html: portalBackgroundColor ? {
          bg: portalBackgroundColor,
        } : {},
      },
    },
  });
}

export default theme;
