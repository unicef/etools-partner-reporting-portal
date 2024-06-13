import {logInfo} from '@unicef-polymer/etools-behaviors/etools-logging';

export interface RouteQueryParam {
  [key: string]: string;
}
export interface RouteParams {
  [key: string]: number | string;
}

export interface RouteQueryParams {
  [key: string]: string;
}

export interface RouteCallbackParams {
  matchDetails: string[];
  queryParams: RouteQueryParams;
}

export interface RouteDetails {
  routeName: string;
  subRouteName: string | null;
  path: string;
  queryParams: RouteQueryParam | null;
  params: RouteParams | null;
}
/**
 * Simple router that will help with:
 *  - registering app routes
 *  - check for app valid routes and get route details, like name, params or queryParams,
 */
export class Router {
  routes: {regex: RegExp | string; handler: (params: RouteCallbackParams) => RouteDetails}[] = [];
  root = '/';

  static clearSlashes(path: string): string {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
  }

  constructor(rootPath?: string) {
    this.root = rootPath && rootPath !== '/' ? '/' + Router.clearSlashes(rootPath) + '/' : '/';
  }

  getLocationPath(path?: string): string {
    path = path || decodeURI(location.pathname + location.search);
    // remove root path
    if (path.indexOf(this.root) === 0) {
      // remove root only if it is the first
      path = path.replace(this.root, '');
    }
    // remove ending slash
    path = path.replace(/\/$/, '');
    return path;
  }

  isRouteAdded(regex: RegExp | null): boolean {
    const filterKey: string = regex instanceof RegExp ? regex.toString() : '';
    const route = this.routes.find((r) => r.regex.toString() === filterKey);
    return !!route;
  }

  addRoute(regex: RegExp | null, handler: (params: RouteCallbackParams) => RouteDetails): Router {
    if (!this.isRouteAdded(regex)) {
      // prevent adding the same route multiple times
      this.routes.push({regex: regex === null ? '' : regex, handler: handler});
    }
    return this;
  }

  buildQueryParams(paramsStr: string): RouteQueryParams {
    const qParams: RouteQueryParams = {} as RouteQueryParams;
    if (paramsStr) {
      const qs: string[] = paramsStr.split('&');
      qs.forEach((qp: string) => {
        const qParam = qp.split('=');
        qParams[qParam[0] as string] = qParam[1];
      });
    }
    return qParams;
  }

  /**
   * This method will match the given path/current location to a registered route.
   * If no route is matched it will return null.
   * If a match is found, based on route regex and match callback, it will return a TRouteDetails object with
   * details about this route: name, sub-route name (if any), route params, query params, route path.
   * @param path
   */
  getRouteDetails(path?: string): RouteDetails | null {
    let routeDetails: RouteDetails | null = null;
    let locationPath: string = path ? this.getLocationPath(path) : this.getLocationPath();
    logInfo(locationPath, 'Router.getRouteDetails.locationPath: ');

    const qsStartIndex: number = locationPath.indexOf('?');
    let qs = '';
    if (qsStartIndex > -1) {
      const loc = locationPath.split('?');
      locationPath = loc[0];
      qs = loc[1];
    }

    for (let i = 0; i < this.routes.length; i++) {
      const match = locationPath.match(this.routes[i].regex);
      if (match) {
        const routeParams: RouteCallbackParams = {
          matchDetails: match.slice(0).map((matchVal: string) => decodeURIComponent(matchVal)),
          queryParams: this.buildQueryParams(qs)
        };
        routeDetails = this.routes[i].handler.bind({}, routeParams)();
        break;
      }
    }
    return routeDetails;
  }

  prepareLocationPath(path: string): string {
    return path.indexOf(this.root) === -1 ? this.root + Router.clearSlashes(path) : path;
  }

  pushState(path?: string) {
    path = path ? this.prepareLocationPath(path) : '';
    history.pushState(window.history.state, '', path);
    return this;
  }

  replaceState(path?: string) {
    path = path ? this.prepareLocationPath(path) : '';
    history.replaceState(window.history.state, '', path);
    return this;
  }
}
