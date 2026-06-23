module.exports = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    // Ajoutez d’autres méthodes si votre code les utilise (e.g. status, headers)
  })
);
