import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { devPort } = require('./package.json');

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 10000,
  },
  server: {
    port: devPort,
    strictPort: true, // fail if the port is taken — never silently grab another app's port
    open: false,
  },
});
