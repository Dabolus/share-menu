import { glob } from 'glob';
import minifyHtml from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import filesize from 'rollup-plugin-filesize';
import { defineConfig } from 'rollup';

const prod = process.env.NODE_ENV === 'production';

const input = glob.sync('src/**/*.ts');

export default defineConfig({
  input,
  output: {
    dir: '.',
    format: 'es',
    sourcemap: prod ? true : 'inline',
    preserveModules: true,
  },
  plugins: [
    ...(prod
      ? [
          (minifyHtml as unknown as { default: typeof minifyHtml }).default({
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
    typescript({ useTsconfigDeclarationDir: true }),
    ...(prod
      ? [
          terser({
            ecma: 2020,
            mangle: {
              properties: {
                regex: /^_/,
              },
            },
          }),
        ]
      : []),
    ...(prod
      ? [
          filesize({
            showMinifiedSize: false,
            showBrotliSize: true,
          }),
        ]
      : []),
  ],
});
