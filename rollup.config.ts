// tslint:disable:object-literal-sort-keys
import { readdirSync } from 'fs';
import { resolve } from 'path';
import minifyHtml from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

const prod = process.env.NODE_ENV === 'production';

const inputs = readdirSync('src')
  .filter((file) => !file.endsWith('.d.ts'))
  .map((file) => file.slice(0, -3));

// TODO: reimplement old multioutput behavior as soon as terser plugins gets fixed
// See: https://github.com/TrySound/rollup-plugin-terser/issues/5
const getConfig = (input, minify) => {
  const baseConfig = {
    input: `src/${input}.ts`,
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: prod,
            sourceMap: !prod,
          },
        },
      }),
      ...minify ? [
        minifyHtml({
          options: {
            shouldMinify: (template) => /\s*<[a-z](?:[^`\\]|\\.)*>\s*/gm.test(template.parts[0].text),
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
        terser(),
      ] : [],
    ],
    // Make all dependencies external
    external: () => true,
  };

  return [{
    ...baseConfig,
    output: {
      file: `${input}${minify ? '.min' : ''}.js`,
      format: 'es',
      sourcemap: !prod,
    },
  }, {
    ...baseConfig,
    output: {
      file: `${input}.iife${minify ? '.min' : ''}.js`,
      format: 'iife',
      name: `dabolus.${input.replace(/-([a-z])/g, ([, l]) => l.toUpperCase())}`,
      globals: {
        [resolve(__dirname, `src/social-icons.js`)]: 'dabolus.socialIcons',
      },
      sourcemap: !prod,
    },
  }];
};

export default inputs.reduce((configs, input) =>
  [...configs, ...getConfig(input, false), ...prod ? [...getConfig(input, true)] : []], []);
