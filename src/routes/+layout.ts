 
import { addTranslations, setLocale, setRoute } from '$lib/translations/index';
import type { LayoutLoad } from './$types'; 

export const load:LayoutLoad = async ({ data }) => {
  const { i18n, translations } = data;
  const { lang, route } = i18n;
  
  addTranslations(translations); 
  await setRoute(route);
  await setLocale(lang);

  return i18n;
};
 