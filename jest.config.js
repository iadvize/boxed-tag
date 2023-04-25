export default {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  testRegex: ['.*\\.test\\.[jt]sx?$'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'ts-jest',
  },
  moduleDirectories: ['node_modules'],
  clearMocks: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
