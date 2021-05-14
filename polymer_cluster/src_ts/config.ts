export const BASE_PATH =
  document.getElementsByTagName('base')[0].href.replace(window.location.origin, '').slice(1, -1) || 'app';

export const getDomainByEnv = () => {
  return document.getElementsByTagName('base')[0].href.slice(0, -1);
};
