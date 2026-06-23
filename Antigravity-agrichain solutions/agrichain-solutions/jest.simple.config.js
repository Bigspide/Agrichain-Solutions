module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testMatch: ['**/src/**/*.test.{ts,tsx,js,jsx}'],
  transformIgnorePatterns: ['/node_modules/'],
  // Mock des modules qui provoquent des effets de bord lors du chargement
  moduleNameMapper: {
    '^@testing-library/react-hooks$': '<rootDir>/src/__mocks__/testing-library-react-hooks.js',
    '^zod$': '<rootDir>/src/__mocks__/zod.js',
    '^next-auth$': '<rootDir>/src/__mocks__/next-auth.js',
    '^next-auth/providers/credentials$': '<rootDir>/src/__mocks__/next-auth.js',
    '^next/router$': '<rootDir>/src/__mocks__/next/router.js',
    '^@/hooks/useI18n$': '<rootDir>/src/__mocks__/useI18n.js',
    '^\\.\\/useI18n$': '<rootDir>/src/__mocks__/useI18n.js',
    '^@/app$': '<rootDir>/src/__mocks__/App.js',
    '^@testing-library/react-hooks$': '<rootDir>/src/__mocks__/testing-library-react-hooks.js',
    '^zod$': '<rootDir>/src/__mocks__/zod.js',
    '^src/server$': '<rootDir>/src/__mocks__/serverMock.js',
    '^node-fetch$': '<rootDir>/src/__mocks__/nodeFetchMock.js',
    // Prisma déjà mocké dans src/__mocks__, on le redirige explicitement au cas où
    '^@prisma/client$': '<rootDir>/src/__mocks__/@prisma/client.js'
  },
  // Désactiver temporairement les setups qui peuvent lancer des mocks complexes
  //setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

};
