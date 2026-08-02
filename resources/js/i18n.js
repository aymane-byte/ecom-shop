import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationAR from './locales/ar/translation.json';
import translationFR from './locales/fr/translation.json';

// the translations
const resources = {
  ar: {
    translation: translationAR
  },
  fr: {
    translation: translationFR
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'fr',

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Set RTL direction for Arabic
i18n.on('languageChanged', (lng) => {
  if (lng === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = lng;
  }
});

export default i18n;
