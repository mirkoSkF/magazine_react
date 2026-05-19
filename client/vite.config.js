import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://sf-magazine-backend:8096',
        changeOrigin: true,
        secure: false,
        // 👇 AGGIUNGI QUESTO BLOCCO QUI SOTTO
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Sovrascrive l'Origin della richiesta verso il backend, 
            // facendogli credere che arrivi da localhost per superare il filtro Java
            proxyReq.setHeader('Origin', 'http://localhost:5173');
          });
        }
      }
    }
  }
})
