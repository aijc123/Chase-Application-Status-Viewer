/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chase: {
          blue: '#117aca',
          dark: '#1d252c',
          navy: '#0b2e4f',
        }
      }
    },
  },
  plugins: [],
}