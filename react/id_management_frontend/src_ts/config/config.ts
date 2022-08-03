export const SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY = 'etoolsAppSmallMenuIsActive';

export const ROOT_PATH =
  document.getElementsByTagName('base')[0].href.replace(window.location.origin, '').slice(1, -1) || '/';

export const getDomainByEnv = () => {
  return document.getElementsByTagName('base')[0].href.slice(0, -1);
};

export const isProductionServer = () => {
  const location = window.location.host;
  return location.indexOf('demo.unicef.io') > -1;
};
