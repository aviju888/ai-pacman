/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pacman: {
          yellow: '#FFFF00',
          blue: '#0000FF',
          pink: '#FFB8FF',
          red: '#FF0000',
          orange: '#FFB852',
          cyan: '#00FFFF',
        }
      }
    },
  },
  plugins: [],
}
