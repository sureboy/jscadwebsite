 
import { loadTranslations, translations } from '$lib/translations/index';
import type { LayoutServerLoad } from './$types';

export const load:LayoutServerLoad = async ({ url, locals } ) => {
  const { pathname  } = url;
  const { lang } = locals as {lang:string};
 

  //const route = pathname//.replace(new RegExp(`^/${lang}`), '');
  //const route=pathname
  await loadTranslations(lang, pathname);
  //console.log("t:",pathname,lang )
  return { i18n: { route:pathname, lang }, translations: translations.get() };
};
 