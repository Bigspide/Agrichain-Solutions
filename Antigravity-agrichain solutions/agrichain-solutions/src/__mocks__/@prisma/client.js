module.exports = {
  PrismaClient: class MockPrismaClient {
    constructor() {
      // No‑op mock – methods can be added per test if needed
    }
  }
};