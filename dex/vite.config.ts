import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from '@svgr/rollup';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),svgr({
    include: '**/*.svg'
  })],
  root: '.',
  build: {
    outDir: 'dist',
  },
  server:{
    proxy: {
      '/api':{
        target: 'https://api.1inch.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
});
