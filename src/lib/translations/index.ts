import i18n from 'sveltekit-i18n';
import lang from './lang.json';
/** @type {import('sveltekit-i18n').Config} */
const config = ({
    translations: {
        en: { lang },
        zh: { lang },
    },
  loaders: [
 
    {
      locale: 'en',
      key: 'header',
      routes: ['/en'], // you can use regexes as well!
      loader: async () => (
        await import('./en/header.json')
      ).default,
    }, 
    {
      locale: 'zh',
      key: 'header',
      routes: ['/zh'],
      loader: async () => (
        await import('./zh/header.json')
      ).default,
    },
  ],
});
export const defaultLocale = 'en'; 
export const { t, locale, locales, loading, addTranslations, loadTranslations, translations, setRoute, setLocale } = new i18n(config);
// Translations logs
loading.subscribe(async ($loading) => {
    if ($loading) {
      console.log('Loading translations...');
  
      await loading.toPromise();
      console.log('Updated translations', translations.get());
    }
  });