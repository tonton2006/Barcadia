/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dungeon: {
          dark: '#1a1a2e',
          medium: '#16213e',
          light: '#0f3460',
          accent: '#e94560',
        }
      }
    },
  },
  plugins: [],
}
