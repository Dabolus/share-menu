// tslint:disable:object-literal-sort-keys
import { readdirSync } from 'fs';
import { resolve } from 'path';
import typescript from 'rollup-plugin-typescript2';

const inputs = readdirSync('src')
  .filter((file) => !file.endsWith('.d.ts'))
  .map((file) => file.slice(0, -3));

export default inputs.map((input) => ({
  input: `src/${input}.ts`,
  output: [{
    file: `${input}.js`,
    format: 'es',
  }, {
    file: `${input}.iife.js`,
    format: 'iife',
    name: `dabolus.${input.replace(/-([a-z])/g, ([, l]) => l.toUpperCase())}`,
    globals: {
      [resolve(__dirname, `src/social-icons.js`)]: 'dabolus.socialIcons',
    },
  }],
  plugins: [
    typescript(),
  ],
  // Make all dependencies external
  external: () => true,
}));
