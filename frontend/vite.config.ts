import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Check if SSL certificates exist
const certPath = path.resolve(__dirname, 'localhost.pem')
const keyPath = path.resolve(__dirname, 'localhost-key.pem')
const hasSSLCerts = fs.existsSync(certPath) && fs.existsSync(keyPath)

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Temporarily disable HTTPS for easier development
    // https: hasSSLCerts ? {
    //   key: fs.readFileSync(keyPath),
    //   cert: fs.readFileSync(certPath),
    // } : false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
}) 