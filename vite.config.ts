import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // listen on all interfaces
    port: 5174, // changed to avoid conflict
    strictPort: true, // fail if port is taken
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['speede-icon.svg'],
      manifest: {
        name: 'SpeedE',
        short_name: 'SpeedE',
        description: 'Thai Community Job Platform',
        theme_color: '#E52020',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'speede-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
