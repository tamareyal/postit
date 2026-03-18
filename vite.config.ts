import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['node43.cs.colman.ac.il'],
    port: 4173, // Ensure this matches what Nginx is looking for
    host: true  // This allows the server to listen on all local network interfaces
  }
})
