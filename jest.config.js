export default {
  preset: "ts-jest/presets/default-esm",
  resolver: "ts-jest-resolver",
  testEnvironment: 'node',
  testMatch: ['**/*_test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest', {
        tsconfig: 'tsconfig.json',
        useESM: true
      }
    ]
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['src/**/*.ts'],
};
