import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/audio-to-text': {
        target: 'http://cncf-app.default.34.133.14.153.sslip.io',
        changeOrigin: true,
      },
    },
  },
}); 