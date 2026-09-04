import viteConfig from './vite.config.ts';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/vitest.setup.ts',
      include: ['./src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    },
  }),
);
