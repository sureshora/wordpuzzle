import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite Config
export default defineConfig({
  plugins: [react()],
  server: {
    host: '162.0.225.90', // Ensure your server IP is correct
    port: 3079           // Port for frontend
  }
})

