/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5fb',
          100: '#e1ebf6',
          200: '#c2d5eb',
          300: '#91b2d7',
          400: '#5887ba',
          500: '#28588f',
          600: '#073477',
          700: '#062b68',
          800: '#052456',
          900: '#041c43',
        },
        accent: { 50: '#edf8fc', 100: '#d4eff8', 500: '#2ca6d0', 600: '#167b9e', 700: '#116581' },
      },
      fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'] },
    },
  },
  plugins: [],
}

