import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  nodeResolve: true,
  files: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  coverageConfig: {
    include: ['src/**/*.ts'],
    threshold: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
