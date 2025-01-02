export default {
  preset: "ts-jest/presets/default-esm",
  resolver: "ts-jest-resolver",
  testEnvironment: 'node',
  testMatch: ['**/*.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest', {
        tsconfig: 'tsconfig.test.json',
        useESM: true
      }
    ]
  },
};
