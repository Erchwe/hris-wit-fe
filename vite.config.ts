import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // <-- Import the 'path' module

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This will redirect the problematic import to our dummy file
      'tailwindcss/version.js': path.resolve(__dirname, 'dummy-version.js'),
    },
  },
})