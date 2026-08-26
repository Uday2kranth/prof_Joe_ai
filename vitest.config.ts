import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      ['src/__tests__/components/**', 'jsdom'],
      ['src/__tests__/ui/**', 'jsdom'],
    ],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.github/**'],
  },
});

