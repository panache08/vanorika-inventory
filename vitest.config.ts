import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    fileParallelism: false, // RLS tests share one DB; run serially
    testTimeout: 20000,
  },
})
