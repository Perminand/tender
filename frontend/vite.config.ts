import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // explicitly use IPv4 localhost
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://127.0.0.1:8080', // Explicitly use IPv4 for the backend
    },
  },
}); 