export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/*.test.{ts,tsx,js,jsx}'],
  transformIgnorePatterns: ['/node_modules/'],
};
