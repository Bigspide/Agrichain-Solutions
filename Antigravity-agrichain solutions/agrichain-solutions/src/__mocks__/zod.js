module.exports = {
  z: {
    string: () => ({
      parse: (val) => String(val),
    }),
    number: () => ({
      parse: (val) => Number(val),
    }),
    boolean: () => ({
      parse: (val) => Boolean(val),
    }),
    object: (shape) => ({
      parse: (obj) => obj,
      ...shape,
    }),
    // Additional helpers can be added as needed
  },
};
