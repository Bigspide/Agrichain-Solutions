module.exports = {
  // Mock d'un serveur HTTP/Socket.io qui ne démarre rien.
  listen: jest.fn(() => ({ close: jest.fn() })),
  // Exportez les propriétés que votre code importe éventuellement.
  app: {},
  io: {}
};
