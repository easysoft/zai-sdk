import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    projects: [{test: {name: 'unit', include: ['tests/*.test.ts'], exclude: ['tests/live.test.ts']}}],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/schema.ts', 'src/types.ts', 'src/operations.ts', 'src/index.ts'],
      reporter: ['text', 'lcov', 'json-summary'],
      thresholds: {lines: 90, statements: 90, functions: 90, branches: 85},
    },
  },
});
