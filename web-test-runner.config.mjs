import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  concurrency: 1,
  nodeResolve: true,
  files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
  browsers: [playwrightLauncher({ product: 'chromium' })],
};
