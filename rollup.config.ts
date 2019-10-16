import { readdirSync } from 'fs';
import { resolve } from 'path';
import minifyHtml from 'rollup-plugin-minify-html-literals';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const prod = process.env.NODE_ENV === 'production';

const inputs = readdirSync('src')
  .filter(file => !file.endsWith('.d.ts'))
  .map(file => file.slice(0, -3));

const getConfig = (input, minify) => ({
  input: `src/${input}.ts`,
  output: [
    {
      file: `${input}.js`,
      format: 'es',
      sourcemap: prod ? false : 'inline',
    },
    {
      file: `${input}.iife.js`,
      format: 'iife',
      name: `dabolus.${input.replace(/-([a-z])/g, ([, l]) => l.toUpperCase())}`,
      globals: {
        [resolve(__dirname, `src/social-icons.js`)]: 'dabolus.socialIcons',
      },
      sourcemap: prod ? false : 'inline',
    },
  ],
  plugins: [
    minifyHtml({
      options: {
        shouldMinify: template =>
          template.parts[0].text.startsWith('<!-- html -->'),
        shouldMinifyCSS: template =>
          template.parts[0].text.startsWith('/* css */'),
        minifyOptions: {
          minifyCSS: {
            level: {
              2: {
                all: true,
              },
            },
          },
          minifyJS: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          collapseInlineTagWhitespace: true,
          removeOptionalTags: true,
          removeTagWhitespace: true,
          sortAttributes: true,
          sortClassName: true,
          removeRedundantAttributes: true,
        },
      },
    }),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: prod,
          sourceMap: !prod,
        },
      },
    }),
    ...(minify
      ? [
          terser({
            mangle: {
              properties: {
                regex: /^_/,
              },
            },
          }),
        ]
      : []),
    replace({
      include: 'src/**/*.ts',
      delimiters: ['', ''],
      './social-icons': './social-icons.js',
    }),
  ],
  // Make all dependencies external
  external: () => true,
});

export default inputs.map(input => getConfig(input, prod));
