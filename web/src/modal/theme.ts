import { extendTheme, Theme } from '@chakra-ui/react';

export const lightColors = {
  background: '#FFFFFF',
  button: '#000000',
  text: '#000000',
  buttonText: '#FFFFFF',
  frameColor: '#C3C8CB',
  contentSecondary: '#C3C8CB',
  content: '#080B0F',
  secondaryButtonBg: '#D8D8D8',
  menuBg: '#0E000E',
  inputBackground: 'rgba(0, 0, 0, 0.05)',
  inputBorder: '1px solid rgba(0, 0, 0, 0.1)'
};

export const darkColors = {
  background: '#080B0F',
  button: '#FFFFFF',
  text: '#FFFFFF',
  buttonText: '#080B0F',
  frameColor: '#C3C8CB',
  contentSecondary: '#39393A',
  content: '#E5E5E5',
  secondaryButtonBg: '#272727',
  menuBg: '#F1FFF1',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
  inputBorder: '1px solid rgba(255, 255, 255, 0.1)'
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
        defaultProps: {
          color: 'brand.text',
        },
        baseStyle: {
          textColor: 'brand.text',
        },
      },
      Button: {
        defaultProps: {
          variant: 'unstyled',
          backgroundColor: 'brand.button',
        },
        baseStyle: {
          variant: 'unstyled',
          background: 'brand.button',
          backgroundColor: 'brand.button',
          color: 'brand.buttonText',
          textColor: 'brand.buttonText',
        },
        variants: {
          'link': {
            background: 'brand.background',
            backgroundColor: 'brand.background',
            _hover: {
              background: 'brand.background',
              backgroundColor: 'brand.background',
            },
          },
        }
      },
      Input: {
        baseStyle: {
          borderColor: 'brand.frameColor',
          textColor: 'brand.text',
          color: 'brand.text',
          background: 'brand.inputBackground',
          border: 'brand.inputBorder',
          borderRadius: '5px',
        },
      },
    },
  }) as Theme;

export const lightTheme = themeFactory(lightColors);
export const darkTheme = themeFactory(darkColors);
