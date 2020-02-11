export const getDomainByEnv = () => {
  if (window.location.port === '8081') {
    return 'http://127.0.0.1:8081/app_poly3';
  }
  return 'https://dev.partnerreportingportal.org';
};
