// tslint:disable:object-literal-sort-keys
import { readdirSync } from 'fs';
import { resolve } from 'path';
import minifyHtml from 'rollup-plugin-minify-html-literals';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const prod = process.env.NODE_ENV === 'production';

const inputs = readdirSync('src')
  .filter((file) => !file.endsWith('.d.ts'))
  .map((file) => file.slice(0, -3));

const getConfig = (input, minify) => ({
  input: `src/${input}.ts`,
  output: [{
    file: `${input}${minify ? '.min' : ''}.js`,
    format: 'es',
    sourcemap: !prod,
  }, {
    file: `${input}.iife${minify ? '.min' : ''}.js`,
    format: 'iife',
    name: `dabolus.${input.replace(/-([a-z])/g, ([, l]) => l.toUpperCase())}`,
    globals: {
      [resolve(__dirname, `src/social-icons.js`)]: 'dabolus.socialIcons',
    },
    sourcemap: !prod,
  }],
  plugins: [
    minifyHtml({
      options: {
        shouldMinify: (template) => template.parts[0].text.startsWith('<!-- html -->'),
        minifyOptions: {
          minifyCSS: true,
          minifyJS: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          removeOptionalTags: true,
          removeTagWhitespace: true,
          sortAttributes: true,
          sortClassName: true,
          removeRedundantAttributes: true,
        }
      }
    }),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: prod,
          sourceMap: !prod,
        },
      },
    }),
    ...minify ? [
      terser({
        mangle: {
          properties: {
            regex: /^_/,
          },
        },
      }),
    ] : [],
    replace({
      'include': 'src/**/*.ts',
      'delimiters': ['', ''],
      './social-icons': `./social-icons${minify ? '.min' : ''}.js`,
    }),
  ],
  // Make all dependencies external
  external: () => true,
});

export default inputs.reduce((configs, input) =>
  [...configs, getConfig(input, false), ...prod ? [getConfig(input, true)] : []], []);
