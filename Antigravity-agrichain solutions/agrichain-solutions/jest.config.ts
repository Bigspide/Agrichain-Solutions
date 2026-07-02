import type { Config } from 'jest';

const config: Config = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  preset: 'ts-jest',
  globals: { 'ts-jest': { isolatedModules: true } },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  // Exclude node_modules from ts‑jest compilation
  // This prevents Jest from trying to compile the entire dependency tree,
  // which is a common cause of hangs during initialization.

    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/.antigravity/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // 'next-auth': '<rootDir>/src/__mocks__/next-auth.js',
    // 'next/router': '<rootDir>/src/__mocks__/next/router.js',
    '@prisma/client': '<rootDir>/src/__mocks__/@prisma/client.js',
    'better-sqlite3': '<rootDir>/src/__mocks__/better-sqlite3.js',
    '^next-i18next/app$': '<rootDir>/__mocks__/next-i18next-app.js',
  },
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/src/**/*.test.{ts,tsx,js,jsx}'],
  // Exclude Playwright E2E specs (they use .spec.ts) from Jest
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.antigravity/', '<rootDir>/e2e/'],
};
export default config;
