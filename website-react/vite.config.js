import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/image': path.resolve(__dirname, './src/compat/next-image.jsx'),
      'next/link': path.resolve(__dirname, './src/compat/next-link.jsx'),
      'next/navigation': path.resolve(__dirname, './src/compat/next-navigation.jsx'),
      'next/dynamic': path.resolve(__dirname, './src/compat/next-dynamic.jsx'),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
