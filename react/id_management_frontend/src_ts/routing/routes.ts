import {Router, RouteCallbackParams, RouteDetails} from './router';
import {store} from '../redux/store';
import {navigate} from '../redux/actions/app';
import {ROOT_PATH} from '../config/config';

export const EtoolsRouter = new Router(ROOT_PATH);
const routeParamRegex = '([^\\/?#=+]+)';

EtoolsRouter.addRoute(new RegExp('^ip-reporting/list$'), (params: RouteCallbackParams): RouteDetails => {
  return {
    routeName: 'ip-reporting',
    subRouteName: 'list',
    path: params.matchDetails[0],
    queryParams: params.queryParams,
    params: null
  };
})
  .addRoute(
    new RegExp(`^ip-reporting\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: 'ip-reporting',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          recordId: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(new RegExp(`^page-not-found$`), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'page-not-found',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  });

/**
 * Utility used to update location based on routes and dispatch navigate action (optional)
 */
export const updateAppLocation = (newLocation: string, dispatchNavigation = true): void => {
  const _newLocation = EtoolsRouter.prepareLocationPath(newLocation);

  EtoolsRouter.pushState(_newLocation);

  if (dispatchNavigation) {
    store.dispatch(navigate(decodeURIComponent(_newLocation)));
  }
};

export const replaceAppLocation = (newLocation: string, dispatchNavigation = true): void => {
  const _newLocation = EtoolsRouter.prepareLocationPath(newLocation);

  EtoolsRouter.replaceState(_newLocation);

  if (dispatchNavigation) {
    store.dispatch(navigate(decodeURIComponent(_newLocation)));
  }
};

export const ROUTE_404 = '/page-not-found';
export const DEFAULT_ROUTE = '/ip-reporting/list';
