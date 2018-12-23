module.exports = {
  rootDir: '.',
  testEnvironment: '@skatejs/ssr/jest',
  transform: {
    '.+\\.[tj]s$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  moduleNameMapper: {
    '(.+)\\.js$': '$1',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
  ],
};
