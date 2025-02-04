import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  test: {
    coverage: {
      enabled: !!process.env.CI,
      provider: 'v8',
    },
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
