/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper': '#FFFCF7',
        'gold': '#C5A059',
      },
      fontFamily: {
        'display': ['"Cinzel Decorative"', 'cursive'],
        'script': ['"Great Vibes"', 'cursive'],
        'serif-body': ['"Cormorant Garamond"', 'serif'],
      }
    },
  },
  plugins: [],
}