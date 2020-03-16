const STAGING_DOMAIN = 'staging.unicef';
const DEV_DOMAIN = 'dev.';
const DEMO_DOMAIN = 'demo.';

export const isStagingServer = () => {
  const location = window.location.href;
  return location.indexOf(STAGING_DOMAIN) > -1;
};

export const isDevServer = () => {
  return window.location.href.indexOf(DEV_DOMAIN) > -1;
};

export const isDemoServer = () => {
  return window.location.href.indexOf(DEMO_DOMAIN) > -1;
};

export const isLocal = () => {
  return ['9000', '8081'].includes(window.location.port);
};

export const getDomainByEnv = () => {
  if (isLocal()) {
    return 'http://127.0.0.1:' + window.location.port + '/app_poly3'
  }
  if (isStagingServer()) {
    return 'https://staging.partnerreportingportal.org/app_poly3';
  }
  if (isDemoServer()) {
    return 'https://demo.partnerreportingportal.org/app_poly3';
  }
  return 'https://dev.partnerreportingportal.org/app_poly3';
};
