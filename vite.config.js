import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Treat `src/public/` as Vite's static public directory so files there are
  // available at the site root (e.g. for favicon).
  publicDir: 'src/public',
  plugins: [react()],
})
