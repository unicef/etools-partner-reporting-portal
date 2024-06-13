import {RouteDetails} from './router';

export interface RoutesLazyLoadComponentsPath {
  [key: string]: string[];
}
// each key from this object is computed from routeName_routeSubPage (if subRoute exists)
export const componentsLazyLoadConfig: RoutesLazyLoadComponentsPath = {
  'ip-reporting_list': ['components/pages/ip-reporting/ip-reporting-list.js'],
  'ip-reporting_details': [
    'components/pages/ip-reporting/ip-reporting-tabs.js',
    'components/pages/ip-reporting/ip-reporting-tab-pages/ip-reporting-details.js'
  ],
  'ip-reporting_questionnaires': [
    'components/pages/ip-reporting/ip-reporting-tabs.js',
    'components/pages/ip-reporting/ip-reporting-tab-pages/ip-reporting-questionnaires.js'
  ],
  'page-not-found': ['components/pages/page-not-found.js']
};

export const getFilePathsToImport = (routeDetails: RouteDetails): string[] => {
  let routeImportsPathsKey: string = routeDetails.routeName;
  if (routeDetails.subRouteName) {
    routeImportsPathsKey += `_${routeDetails.subRouteName}`;
  }

  const filesToImport: string[] = componentsLazyLoadConfig[routeImportsPathsKey];
  if (!filesToImport || filesToImport.length === 0) {
    throw new Error('No file imports configuration found (componentsLazyLoadConfig)!');
  }
  return filesToImport;
};
