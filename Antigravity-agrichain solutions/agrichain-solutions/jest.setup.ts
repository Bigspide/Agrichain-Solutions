// Mock next-auth to avoid ESM issues in tests
jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({})),
  Auth: jest.fn(),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  })),
}));

jest.mock('next-auth/jwt', () => ({
  __esModule: true,
  getToken: jest.fn(),
}));