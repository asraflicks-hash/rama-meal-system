/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wheat: {
          50: '#fdfbf7',
          100: '#fbf7ee',
          200: '#f5ecd6',
          300: '#eddbb2',
          400: '#e2c385',
          500: '#d4a85a',
          600: '#be8c42',
          700: '#9b6e35',
          800: '#7e5730',
          900: '#67472c',
        },
        mustard: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        mill: {
          dark: '#1c1917',
          card: '#292524',
          accent: '#d97706',
          forest: '#14532d',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
