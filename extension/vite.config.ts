import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/recorder.ts'),
        popup: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background/index.js';
          if (chunkInfo.name === 'content') return 'content/recorder.js';
          if (chunkInfo.name === 'popup') return 'popup/index.js';
          return '[name]/[name].js';
        },
        assetFileNames: '[name]/[name].[ext]',
        chunkFileNames: 'chunks/[name].js',
      },
    },
  },
});