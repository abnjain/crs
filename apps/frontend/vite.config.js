import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { config } from './src/config/config.js';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    port: config.server.port,
    proxy: {
      '/api': {
        target: config.api.baseUrl,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": `${path.resolve(__dirname, "./src")}/`,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
  },
})