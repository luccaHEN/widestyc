/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        twitch: {
          DEFAULT: '#9146FF',
          dark: '#772CE8',
        },
        dark: {
          bg: '#18181B', // Zinc 900
          panel: '#27272A', // Zinc 800
        }
      }
    },
  },
  plugins: [],
}
