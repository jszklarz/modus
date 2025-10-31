import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'resources',
    emptyOutDir: false, // Don't empty the entire resources dir (keeps icons, etc.)
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'styles.css';
          }
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
