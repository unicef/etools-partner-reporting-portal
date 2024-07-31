import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {
  EtoolsRouteCallbackParams,
  EtoolsRouteDetails
} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';

const routeParamRegex = '([^\\/?#=+]+)';

EtoolsRouter.init({
  baseUrl: Environment.basePath,
  redirectPaths: {
    notFound: '/not-found',
    default: '/'
  },
  redirectedPathsToSubpageLists: []
});

EtoolsRouter.addRoute(new RegExp(`^login$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
  return {
    routeName: 'login',
    subRouteName: null,
    path: params.matchDetails[0],
    queryParams: null,
    params: null
  };
})
  .addRoute(new RegExp(`^not-found$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'not-found',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(new RegExp(`^unauthorized$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'unauthorized',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(new RegExp(`^login-token$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'login-token',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(new RegExp(`^${routeParamRegex}$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'app',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: {
        workspaceId: params.matchDetails[1]
      }
    };
  })

  .addRoute(new RegExp(`^$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'app',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: {
        workspaceId: params.matchDetails[1]
      }
    };
  })

  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'app',
        subRouteName: params.matchDetails[2],
        path: params.matchDetails[0],
        queryParams: null,
        params: {
          workspaceId: params.matchDetails[1]
        }
      };
    }
  )

  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'app',
        subRouteName: params.matchDetails[2],
        subSubRouteName: params.matchDetails[3],
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          workspaceId: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}\\/pd\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'app',
        subRouteName: params.matchDetails[2],
        subSubRouteName: 'pd',
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          workspaceId: params.matchDetails[1],
          pdID: params.matchDetails[3]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}\\/pd\\/${routeParamRegex}/edit$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'app',
        subRouteName: params.matchDetails[2],
        subSubRouteName: 'pd',
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          workspaceId: params.matchDetails[1],
          pdID: params.matchDetails[3],
          mode: 'edit'
        }
      };
    }
  )
  .addRoute(
    new RegExp(
      `^${routeParamRegex}\\/${routeParamRegex}\\/pd\\/${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$`
    ),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'app',
        subRouteName: params.matchDetails[2],
        subSubRouteName: 'pd',
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          workspaceId: params.matchDetails[1],
          pdID: params.matchDetails[3],
          pdRoute: params.matchDetails[4],
          activeTab: params.matchDetails[5]
        }
      };
    }
  )
  .addRoute(
    new RegExp(
      `^${routeParamRegex}\\/${routeParamRegex}\\/pd\\/${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$` // eslint-disable-line
    ),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'app',
        subRouteName: params.matchDetails[2],
        subSubRouteName: 'pd',
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          workspaceId: params.matchDetails[1],
          pdID: params.matchDetails[3],
          pdRoute: params.matchDetails[4],
          mode: params.matchDetails[6],
          reportId: params.matchDetails[5]
        }
      };
    }
  );
