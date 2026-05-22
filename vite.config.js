import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change base to match your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/fh6-data-entry/',
})
