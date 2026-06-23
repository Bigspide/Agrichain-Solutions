module.exports = {
  __esModule: true,
  // Default export used by NextAuth initialization – returns a no‑op handler.
  default: jest.fn(() => (req, res) => {}),
  // Named exports used in auth.ts
  NextAuth: jest.fn(() => ({})),
  Credentials: jest.fn(() => ({})),
  // Placeholders for other exports used in tests
  Auth: jest.fn(),
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn()
};