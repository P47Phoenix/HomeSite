import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Dev-server-only entry; the shipped artifact is the prerendered zero-JS page.
      exclude: ['src/main.tsx'],
      reporter: ['text'],
      // M4: the coverage floor is versioned with the code — never in CI YAML.
      thresholds: {
        lines: 80,
      },
    },
  },
});
