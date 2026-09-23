/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared/index.ts')
    }
  },
  test: {
    include: ['src/**/*.spec.ts'],
    exclude: ['dist/**', 'dist-server/**', 'node_modules/**']
  },
  server: {
    port: 3000,
    host: true
  }
});
