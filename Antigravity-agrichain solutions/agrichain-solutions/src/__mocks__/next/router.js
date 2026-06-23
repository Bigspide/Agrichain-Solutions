module.exports = {
  useRouter: jest.fn(() => ({
    pathname: '/',
    push: jest.fn(),
    query: {}
  }))
};