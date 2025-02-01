import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '.vitest',
  test: {
    setupFiles: ['src/testing/init-test.ts'],
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    globals: true,
    restoreMocks: true,
    // browser: {
    //   provider: 'playwright', // or 'webdriverio'
    //   enabled: true,
    //   instances: [{ browser: 'chromium' }],
    // },
  },
  plugins: [
    tsconfigPaths(),
    swc.vite({
      include: /\.[mc]?[jt]sx?$/,
      exclude: [
        /node_modules\/(?!injection-js|\.pnpm)/,
        /node_modules\/\.pnpm\/(?!injection-js)/,
      ] as any,
    }),
  ],
});
