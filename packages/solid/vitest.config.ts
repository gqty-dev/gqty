import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  test: {
    coverage: {
      enabled: !!process.env.CI,
    },
    environment: 'jsdom',
  },
});
