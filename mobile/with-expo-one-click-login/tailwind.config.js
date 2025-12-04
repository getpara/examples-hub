/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#ffc9a6',
          300: '#ffa36d',
          400: '#ff7635',
          500: '#ff4e00',
          600: '#f03d00',
          700: '#c72c00',
        },
      },
    },
  },
  plugins: [],
};
