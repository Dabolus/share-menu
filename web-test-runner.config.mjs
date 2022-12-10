import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
  plugins: [esbuildPlugin({ ts: true })],
};
