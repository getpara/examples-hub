import { extendTheme, ThemeConfig } from '@chakra-ui/react'


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
})


export default theme
