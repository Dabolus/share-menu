const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('webpack-merge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        // runs all files ending with .spec in the test folder,
        // can be overwritten by passing a --grep flag. examples:
        //
        // npm test -- --grep test/foo/bar.spec.ts
        // npm test -- --grep test/bar/*
        {
          pattern: config.grep ? config.grep : 'test/**/*.spec.ts',
          type: 'module',
        },
      ],
      esm: {
        babel: true,
        nodeResolve: true,
        fileExtensions: ['.ts'],
      },
    }),
  );
  return config;
};
