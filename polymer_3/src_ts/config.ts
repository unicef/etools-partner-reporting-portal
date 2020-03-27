export const BASE_PATH = "app";

export const getDomainByEnv = () => {
  return document.getElementsByTagName('base')[0].href.slice(0,-1)
};
