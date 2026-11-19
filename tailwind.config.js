/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        celeste: { DEFAULT: '#74a9dd', light: '#a9cdf0', dark: '#3f7fc0' },
        noche: { DEFAULT: '#0b1f3a', dark: '#06142a', light: '#14305a' },
      },
      fontFamily: { display: ['"Bebas Neue"', 'sans-serif'] },
    },
  },
  plugins: [],
}
