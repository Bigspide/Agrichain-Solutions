/**
 * next-i18next configuration file.
 * See https://github.com/i18next/next-i18next#configuration for options.
 */
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'wo', 'bm', 'ha', 'sw', 'zh', 'ar', 'es', 'pt', 'be', 'di', 'ba', 'at', 'ya', 'go', 'aj', 'al', 'eb'],
  },
  localePath: path.resolve('./public/locales'),
  // Disable server side rendering for now, we will use middleware.
  // If you need SSR, set serverSideTranslations.
  defaultNS: 'common',
  backend: {
    // Uncomment if you load translations from a backend.
  },
  // Detect language from header or cookie.
  detection: {
    order: ['cookie', 'header', 'querystring', 'navigator', 'localStorage', 'sessionStorage', 'path', 'subdomain'],
    caches: ['cookie'],
  },
};
