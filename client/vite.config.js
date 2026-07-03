import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: false,
    proxy: {
      // Proxy per le API
      '/api': {
        target: 'http://sf-magazine-backend:8096',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', 'http://localhost:5173');
          });
        }
      },
      // 🟢 AGGIUNTO: Proxy per i file multimediali caricati
      '/uploads': {
        target: 'http://sf-magazine-backend:8096',
        changeOrigin: true,
        secure: false
      }
    }
  }
})