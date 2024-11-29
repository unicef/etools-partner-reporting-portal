/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/* eslint-disable max-len*/
import {Action, ActionCreator} from 'redux';
// import {UPDATE_ROUTE_DETAILS} from './actionsConstants';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import Constants from '../../etools-prp-common/constants.js';

export interface AppActionUpdateDrawerState extends Action<'UPDATE_DRAWER_STATE'> {
  opened: boolean;
}
export interface AppActionShowToast extends Action<'SHOW_TOAST'> {
  active: boolean;
  message: string;
  showCloseBtn: boolean;
}

export type AppActionCloseToast = Action<'CLOSE_TOAST'>;
export interface AppActionUpdateRouteDetails extends Action<'UPDATE_ROUTE_DETAILS'> {
  routeDetails: EtoolsRouteDetails;
}
export type AppAction =
  | AppActionUpdateDrawerState
  | AppActionShowToast
  | AppActionCloseToast
  | AppActionUpdateRouteDetails;

export const updateStoreRouteDetails: ActionCreator<AppActionUpdateRouteDetails> = (routeDetails: any) => {
  return {
    type: Constants.UPDATE_ROUTE_DETAILS as any,
    routeDetails
  };
};

const importPdSubRoutes = (routeDetails: EtoolsRouteDetails) => {
  let imported: Promise<any> | undefined;

  switch (routeDetails.params?.pdRoute) {
    case 'details':
      imported = import('../../pages/app/ip-reporting/pd/pd-details.js');
      break;
    case 'report':
      imported = import('../../pages/app/ip-reporting/pd/pd-report.js');
      break;
    default:
      imported = import('../../pages/app/ip-reporting/pd/pd-details.js');
      break;
  }

  // imported?.then(() => {
  //   console.log('Imported importPdSubRoutes', routeDetails.subRouteName, routeDetails.params?.pdRoute);
  // });

  return imported;
};

const importPdRoutes = (routeDetails: EtoolsRouteDetails) => {
  let imported: Promise<any> | undefined;

  if (routeDetails.params?.pdID) {
    imported = import('../../pages/app/ip-reporting/pd/pd-router.js').then(() => {
      importPdSubRoutes(routeDetails);
    });
  } else {
    imported = import('../../pages/app/ip-reporting/pd/pd-index.js');
  }

  // imported?.then(() => {
  //   console.log('Imported importPdRoutes', routeDetails.subRouteName);
  // });

  return imported;
};

const importGpdSubRoutes = (routeDetails: EtoolsRouteDetails) => {
  let imported: Promise<any> | undefined;

  switch (routeDetails.params?.pdRoute) {
    case 'details':
      imported = import('../../pages/app/ip-reporting/gpd/gpd-details.js');
      break;
    case 'report':
      imported = import('../../pages/app/ip-reporting/gpd/gpd-report.js');
      break;
    default:
      imported = import('../../pages/app/ip-reporting/gpd/gpd-details.js');
      break;
  }
  return imported;
};

const importGpdRoutes = (routeDetails: EtoolsRouteDetails) => {
  let imported: Promise<any> | undefined;

  if (routeDetails.params?.pdID) {
    imported = import('../../pages/app/ip-reporting/gpd/gpd-router.js')
      .then(() => {
        importGpdSubRoutes(routeDetails);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    imported = import('../../pages/app/ip-reporting/gpd/gpd-index.js');
  }
  return imported;
};

const importSubSubRoutes = (routeDetails: EtoolsRouteDetails) => {
  let imported: Promise<any> | undefined;
  switch (routeDetails.subSubRouteName) {
    case 'overview':
      imported = import('../../pages/app/ip-reporting/overview.js');
      break;
    case 'indicators':
      imported = import('../../pages/app/ip-reporting/indicators.js');
      break;
    case 'pd':
      imported = import('../../pages/app/ip-reporting/pd.js').then(() => {
        importPdRoutes(routeDetails);
      });
      break;
    case 'gpd':
      imported = import('../../pages/app/ip-reporting/gpd.js')
        .then(() => {
          importGpdRoutes(routeDetails);
        })
        .catch((err) => {
          console.log(err);
        });
      break;
    case 'progress-reports':
      imported = import('../../pages/app/ip-reporting/progress-reports.js');
      break;
    default:
      imported = import('../../pages/app/ip-reporting/overview.js');
      break;
  }

  // imported?.then(() => {
  //   console.log('Imported importSubSubRoutes', routeDetails.subSubRouteName);
  // });

  return imported;
};

const importSubRoutes = (routeDetails: EtoolsRouteDetails) => {
  let imported: Promise<any> | undefined;

  switch (routeDetails.subRouteName) {
    case 'ip-reporting':
      imported = import('../../pages/app/ip-reporting.js').then(() => importSubSubRoutes(routeDetails));
      break;
    default:
      imported = import('../../pages/app/ip-reporting.js').then(() => importSubSubRoutes(routeDetails));
      break;
  }

  // imported?.then(() => {
  //   console.log('Imported importSubRoutes', routeDetails.subRouteName);
  // });

  return imported;
};

const loadPageComponents = (routeDetails: EtoolsRouteDetails) => (_dispatch: any, _getState: any) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    return;
  }

  let imported: Promise<any> | undefined;
  const appShell = document.body.querySelector('app-shell');

  switch (routeDetails.routeName) {
    case 'app':
      imported = import('../../pages/app.js').then(() => importSubRoutes(routeDetails));
      break;
    case 'unauthorized':
      imported = import('../../pages/unauthorized.js');
      break;
    case 'not-found':
      imported = import('../../pages/not-found.js');
      break;
    case 'login-token':
      imported = import('../../pages/login-token.js');
      break;
    case 'login':
      imported = import('../../pages/login.js');
      break;
    default:
      imported = import('../../pages/app.js').then(() => importSubRoutes(routeDetails));
      break;
  }

  if (imported) {
    imported
      .catch((err) => {
        console.log(err);
        EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      })
      .finally(() =>
        fireEvent(appShell, 'global-loading', {
          active: false,
          loadingSource: 'initialisation'
        })
      );
  }
};

/** Update Redux route details and import lazy loaded pages */
export const handleUrlChange = (path: string) => (dispatch: any, getState: any) => {
  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (
    path === Environment.basePath &&
    Environment.basePath !== EtoolsRouter.prepareLocationPath(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT))
  ) {
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = EtoolsRouter.getRedirectToListPath(path);
  if (redirectPath) {
    EtoolsRouter.updateAppLocation(redirectPath);
    return;
  }

  // handle can Access
  const currentRouteDetails = getState().app.routeDetails;
  const routeDetails = EtoolsRouter.getRouteDetails(path);
  dispatch(loadPageComponents(routeDetails!));
  if (!isJsonStrMatch(routeDetails, currentRouteDetails)) {
    dispatch(updateStoreRouteDetails(routeDetails));
  }
};
