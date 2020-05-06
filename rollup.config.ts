import glob from 'glob';
import { resolve } from 'path';
import minifyHtml from 'rollup-plugin-minify-html-literals';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';

const prod = process.env.NODE_ENV === 'production';

const inputs = glob.sync('src/**/*.ts').map((file) => file.slice(4, -3));

const getConfig = (input, minify) => ({
  input: `src/${input}.ts`,
  output: [
    {
      file: `${input}${minify ? '.min' : ''}.js`,
      format: 'es',
      sourcemap: prod ? false : 'inline',
    },
    {
      file: `${input}.iife${minify ? '.min' : ''}.js`,
      format: 'iife',
      name: `dabolus.${input.replace(/-([a-z])/g, ([, l]) => l.toUpperCase())}`,
      globals: inputs
        .filter((i) => i !== input)
        .reduce(
          (globals, i) => ({
            ...globals,
            [resolve(
              __dirname,
              `src/${i}${minify ? '.min' : ''}.js`,
            )]: `dabolus.${i.replace(/-([a-z])/g, ([, l]) => l.toUpperCase())}`,
          }),
          {},
        ),
      sourcemap: prod ? false : 'inline',
    },
  ],
  plugins: [
    ...(minify
      ? [
          minifyHtml({
            options: {
              shouldMinify: (template) =>
                template.parts[0].text.startsWith('<!-- html -->'),
              shouldMinifyCSS: (template) =>
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
        ]
      : []),
    typescript({
      useTsconfigDeclarationDir: true,
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
            ecma: 8,
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
      '../share-target': `../share-target${minify ? '.min' : ''}.js`,
    }),
    ...(prod
      ? [
          filesize({
            showMinifiedSize: false,
            showBrotliSize: true,
          }),
        ]
      : []),
  ],
  // Make all dependencies external
  external: () => true,
});

export default inputs.reduce(
  (configs, input) => [
    ...configs,
    getConfig(input, false),
    ...(prod ? [getConfig(input, true)] : []),
  ],
  [],
);
