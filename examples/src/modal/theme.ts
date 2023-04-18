import { extendTheme, Theme } from '@chakra-ui/react';

export const lightColors = {
  background: '#dfdfe2',
  backgroundLight: '#c2c2cb',
  button: '#4484bd',
  text: '#000000',
  buttonText: '#dfdfe2',
  selectedButton: '#325576',
  frameColor: '#0a243b',
};

export const darkColors = {
  background: '#031e2a',
  backgroundLight: '#062734',
  button: '#21465c',
  text: '#c3c8cb',
  buttonText: '#c3c8cb',
  selectedButton: '#294a61',
  frameColor: '#c3c8cb',
};

export const themeFactory = (colors: typeof lightColors) =>
  extendTheme({
    colors: {
      brand: {
        ...colors,
      },
    },
    components: {
      Text: {
        baseStyle: {
          color: 'brand.text',
        },
      },
      Button: {
        defaultProps: {
          // colorScheme: 'teal',
          backgroundColor: 'brand.buttonText',
        },
        baseStyle: {
          background: 'brand.button',
          backgroundColor: 'brand.button',
          _hover: {
            background: 'brand.selectedButton',
            backgroundColor: 'brand.selectedButton',
          },

          color: 'brand.buttonText',
        },
      },
    },
  }) as Theme;

export const lightTheme = themeFactory(lightColors);
export const darkTheme = themeFactory(darkColors);
