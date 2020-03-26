export const BASE_PATH = "app";

export const isLocal = () => {
  return ['9000', '8081'].includes(window.location.port);
};

export const getDomainByEnv = () => {
  if (isLocal()) {
    return 'http://127.0.0.1:' + window.location.port + '/' + BASE_PATH;
  }
  return window.location.origin;
};
