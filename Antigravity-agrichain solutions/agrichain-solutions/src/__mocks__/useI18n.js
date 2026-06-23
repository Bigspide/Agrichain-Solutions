module.exports = {
  useI18n: () => ({
    locale: 'en',
    locales: ['en', 'fr'],
    changeLanguage: jest.fn(),
  }),
};
