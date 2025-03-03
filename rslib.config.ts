import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.lib.json',
  },
  lib: [
    {
      format: 'esm',
      syntax: 'es2021',
      bundle: false,
      dts: {
        bundle: false,
        build: false,
        distPath: './dist',
      },
      source: {
        entry: {
          index: ['src/**/*.ts', '!**/*.spec.ts', '!src/testing/**/*'],
        },
      },
    },
    {
      format: 'cjs',
      syntax: 'es2021',
      dts: false,
      bundle: true,
      source: {
        entry: {
          index: './src/index.ts',
          'adapters/react': './src/adapters/react/index.ts',
          'adapters/solid-js': './src/adapters/solid-js/index.ts',
          'adapters/@tanstack/react-router':
            './src/adapters/@tanstack/react-router.ts',
          'adapters/@tanstack/solid-router':
            './src/adapters/@tanstack/solid-router.ts',
        },
      },
    },
  ],
  output: {
    target: 'web',
  },
});
