import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages deployment
  // Change 'Barcadia' to your repo name if different
  base: process.env.GITHUB_ACTIONS ? '/Barcadia/' : '/',
})
